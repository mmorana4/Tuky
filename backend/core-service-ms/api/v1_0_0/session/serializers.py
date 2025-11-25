from django.contrib.auth import get_user_model
from rest_framework import serializers
from helpers.model_helper import HelperSerializerModel
from helpers.response_helper import HelperResponse

User = get_user_model()


class CompanyBranchSerializer(HelperSerializerModel):
    class Meta:
        from security.models import CompanyBranch
        model = CompanyBranch
        fields = ['id', 'name', 'short_name', 'address', 'phone', 'email', 'is_main', 'is_current']


class RoleSerializer(HelperSerializerModel):
    class Meta:
        from security.models import Role
        model = Role
        fields = ['id', 'route', 'name', 'code', 'legend', 'is_current', 'is_system', 'level_authority', 'weight']

