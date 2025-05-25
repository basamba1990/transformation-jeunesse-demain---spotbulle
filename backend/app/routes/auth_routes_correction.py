# Correction pour auth_routes.py

# Dans la fonction register_user, remplacer:
# return user_schema.User.from_orm(created_user)

# Par:
return user_schema.User.model_validate(created_user)

# Dans la fonction get_current_user, remplacer:
# return current_user.model_dump()

# Par:
return current_user
