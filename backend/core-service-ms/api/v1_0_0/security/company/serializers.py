from django.contrib.auth import get_user_model
from rest_framework import serializers
from helpers.model_helper import HelperSerializerModel
from helpers.response_helper import HelperResponse


class CompanySerializer(HelperSerializerModel):
    class Meta:
        from security.models import Company
        model = Company
        fields = ['id', 'ruc', 'name', 'short_name', 'website', 'address', 'is_active']
