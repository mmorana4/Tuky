from django.core import serializers
from django.core.cache import cache

from core.my_base import MY_TITLE_SYSTEM_KEY, MY_CACHE_LIFETIME


class MyRedis:
    PREFIX = f"{MY_TITLE_SYSTEM_KEY}".lower().strip()
    SUFFIX = "api"


class RedisKeys:
    # SYSTEM_PROFILE = f"{MyRedis.PREFIX}:{MyRedis.SUFFIX}:{{}}:system_profile:{{}}:{{}}"
    # SYSTEM_ROLE = f"{MyRedis.PREFIX}:{MyRedis.SUFFIX}:{{}}:system_role:{{}}:{{}}"
    SYSTEM_ROLE_COMPANYBRANCHS = f"{MyRedis.PREFIX}:{MyRedis.SUFFIX}:{{}}:role:{{}}:{{}}:companybranchs"
    # SYSTEM_ROLECOMPANYBRANCH = f"{MyRedis.PREFIX}:{MyRedis.SUFFIX}:{{}}:rolecompanybranch:{{}}:{{}}"
    # SYSTEM_ROLECOMPANYBRANCH_PERMISSIONS = f"{MyRedis.PREFIX}:{MyRedis.SUFFIX}:{{}}:rolecompanybranch:{{}}:{{}}:permissions"
    # MODULE = f"{MyRedis.PREFIX}:{MyRedis.SUFFIX}:{{}}:module:{{}}:{{}}"
    # MODULE_PROFILES = f"{MyRedis.PREFIX}:{MyRedis.SUFFIX}:{{}}:module:{{}}:{{}}:profiles"
    # MODULE_PERMISSIONS = f"{MyRedis.PREFIX}:{MyRedis.SUFFIX}:{{}}:module:{{}}:{{}}:permissions"


class MY_Cache:

    def __init__(self, key='', lifetime=MY_CACHE_LIFETIME):
        self.key = key
        self.lifetime = lifetime

    def has_key(self):
        return cache.has_key(self.key)

    def get(self):
        return cache.get(self.key)

    def set(self, data):
        cache.set(self.key, data, self.lifetime)

    # Recuperar el objeto desde caché
    def get_model_object(self):
        cached_data = self.get()
        if cached_data:
            try:
                for deserialized in serializers.deserialize('json', cached_data):
                    return deserialized.object  # Devuelve la instancia del modelo
            except Exception as e:
                # Podrías hacer logging del error aquí
                return None
        return None

    # Almacenar un objeto modelo en caché
    def set_model_object(self, instance):
        if instance:
            serialized_data = serializers.serialize('json', [instance])
            cache.set(self.key, serialized_data, self.lifetime)

    def delete(self):
        if self.has_key():
            cache.delete(self.key)
