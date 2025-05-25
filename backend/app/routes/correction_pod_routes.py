# Correction pour routes/pod_routes.py

# Remplacer toutes les occurrences de:
# return pod_schema.Pod.from_orm(pod)
# ou
# return [pod_schema.Pod.from_orm(pod) for pod in pods]

# Par:
return pod_schema.Pod.model_validate(pod)
# ou
return [pod_schema.Pod.model_validate(pod) for pod in pods]

# Supprimer également les conditions avec hasattr comme:
# if hasattr(pod_schema.Pod, 'model_validate'):
#     return pod_schema.Pod.model_validate(pod)
# else:
#     return pod_schema.Pod.from_orm(pod)

# Remplacer par simplement:
return pod_schema.Pod.model_validate(pod)
