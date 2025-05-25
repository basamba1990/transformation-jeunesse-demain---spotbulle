# Correction pour routes/auth_routes.py

# Remplacer cette ligne dans la fonction register_user:
# return user_schema.User.from_orm(created_user)

# Par celle-ci:
return user_schema.User.model_validate(created_user)
