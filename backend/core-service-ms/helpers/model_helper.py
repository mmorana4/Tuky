# -*- coding: utf-8 -*-
from django.contrib.auth.models import User, Group
from rest_framework import serializers
from core.my_base import (DATETIME_INPUT_FORMATS, DATETIME_FORMAT, DATE_INPUT_FORMATS, DATE_FORMAT,
                          TIME_INPUT_FORMATS, TIME_FORMAT)


class HelperSerializerModel(serializers.ModelSerializer):
    display = serializers.SerializerMethodField()
    id_display = serializers.SerializerMethodField()

    def get_fields(self):
        fields = super(HelperSerializerModel, self).get_fields()

        exclude_fields = self.context.get('exclude_fields', [])
        for field in exclude_fields:
            fields.pop(field, default=None)

        return fields

    def get_created_at(self, obj):
        return obj.created_at.strftime(DATETIME_FORMAT) if obj.created_at else None

    def get_updated_at(self, obj):
        return obj.updated_at.strftime(DATETIME_FORMAT) if obj.updated_at else None

    def get_display(self, obj):
        return obj.__str__() if obj.__str__() else None

    def get_id_display(self, obj):
        return obj.id_display() if obj.id_display else None
