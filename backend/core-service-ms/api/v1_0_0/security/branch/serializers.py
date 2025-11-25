from django.contrib.auth import get_user_model
from rest_framework import serializers
from helpers.model_helper import HelperSerializerModel
from helpers.response_helper import HelperResponse


class CompanyBranchSerializer(HelperSerializerModel):
    from ..company.serializers import CompanySerializer
    company = CompanySerializer()

    class Meta:
        from security.models import CompanyBranch
        model = CompanyBranch
        fields = ['id', 'company', 'name', 'short_name', 'address', 'phone', 'email', 'is_main', 'is_current']
