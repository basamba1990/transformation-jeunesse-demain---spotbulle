# Correction pour pod_routes.py

# Remplacer toutes les occurrences de:
# if hasattr(pod_schema.Pod, 'model_validate'):
#     return pod_schema.Pod.model_validate(pod)
# else:
#     return pod_schema.Pod.from_orm(pod)

# Par simplement:
return pod_schema.Pod.model_validate(pod)

# De même pour les listes:
# if hasattr(pod_schema.Pod, 'model_validate'):
#     return [pod_schema.Pod.model_validate(pod) for pod in pods]
# else:
#     return [pod_schema.Pod.from_orm(pod) for pod in pods]

# Par:
return [pod_schema.Pod.model_validate(pod) for pod in pods]
