# backend/app/services/storage_service.py
import os
from supabase import create_client, Client
from fastapi import UploadFile
import uuid

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BUCKET_NAME = os.getenv("BUCKET_NAME", "audio_pods") # Default bucket name if not set

if not SUPABASE_URL or not SUPABASE_KEY:
    print("WARNING: Supabase URL or Key not configured. Storage service will not work.")
    # You might want to raise an exception here or handle this case appropriately
    # For now, we allow the service to load but operations will fail.
    supabase: Client | None = None
else:
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"Error initializing Supabase client: {e}")
        supabase = None

async def upload_audio_to_supabase(file: UploadFile, user_id: int) -> str | None:
    """
    Uploads an audio file to Supabase Storage and returns its public URL.
    Files are stored in a folder named after the user_id.
    """
    if not supabase or not BUCKET_NAME:
        print("Supabase client or bucket name not configured.")
        return None

    try:
        file_content = await file.read()
        # Sanitize filename or create a unique one
        file_extension = os.path.splitext(file.filename)[1] if file.filename else ".mp3" # Default to mp3 if no extension
        # Ensure filename is safe and unique
        safe_filename = f"{uuid.uuid4()}{file_extension}"
        storage_path = f"{user_id}/{safe_filename}" # Store in a user-specific folder

        response = supabase.storage.from_(BUCKET_NAME).upload(
            path=storage_path, 
            file=file_content,
            file_options={"content-type": file.content_type or "audio/mpeg"} # Use provided content type or default
        )

        if response.status_code == 200: # Supabase client might return dict or object with status_code
            # Construct the public URL. The exact method might vary slightly based on Supabase client version or settings.
            # Typically, it's SUPABASE_URL/storage/v1/object/public/BUCKET_NAME/STORAGE_PATH
            public_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{storage_path}"
            return public_url
        else:
            # Attempt to get error details from response if available
            error_message = "Unknown error during upload."
            if hasattr(response, 'json') and callable(response.json):
                try:
                    error_data = response.json()
                    error_message = error_data.get("message", error_message)
                except Exception:
                    pass # Keep default error message
            elif hasattr(response, 'text'):
                error_message = response.text
            print(f"Error uploading to Supabase: {response.status_code} - {error_message}")
            return None

    except Exception as e:
        print(f"Exception during Supabase upload: {e}")
        return None

async def delete_audio_from_supabase(file_url: str) -> bool:
    """
    Deletes an audio file from Supabase Storage based on its public URL.
    This function needs to parse the storage path from the URL.
    """
    if not supabase or not BUCKET_NAME or not SUPABASE_URL:
        print("Supabase client, bucket name, or URL not configured.")
        return False

    try:
        # Expected URL format: SUPABASE_URL/storage/v1/object/public/BUCKET_NAME/path/to/file.mp3
        prefix_to_remove = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/"
        if not file_url.startswith(prefix_to_remove):
            print(f"Invalid file URL format: {file_url}")
            return False
        
        storage_path = file_url[len(prefix_to_remove):]
        
        response = supabase.storage.from_(BUCKET_NAME).remove([storage_path])

        if response.status_code == 200:
            # Check if the response indicates successful deletion for the specific file
            # The Supabase client might return a list of dicts, one for each file operation
            data = response.json()
            if data and isinstance(data, list) and len(data) > 0 and data[0].get("message") == "Successfully removed":
                 return True
            elif data and isinstance(data, list) and len(data) > 0 : # check if error message is present
                print(f"Error in Supabase delete response data: {data[0]}")
                return False 
            else:
                print(f"Supabase delete response indicates potential issue: {data}")
                return False # Or True if partial success is acceptable and data is empty
        else:
            print(f"Error deleting from Supabase: {response.status_code} - {response.text}")
            return False

    except Exception as e:
        print(f"Exception during Supabase delete: {e}")
        return False

