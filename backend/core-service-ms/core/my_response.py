# -*- coding: utf-8 -*-
from django.core import serializers


class MyResponse:

    def __init__(self):
        self.is_success = False
        self.message = None
        self.data = {}

    def set_success(self, is_success=False):
        if not isinstance(is_success, bool):
            return self.is_success
        self.is_success = is_success

    def set_message(self, message=None):
        if not isinstance(message, str):
            return self.message
        self.message = message

    def set_data(self, data=None):
        if not isinstance(data, dict):
            return self.data
        self.data = data or {}

    def get_in_data(self, index):
        if isinstance(self.data, dict) and index in self.data:
            return self.data.get(index)
        return {}

    def to_dict(self, show_empty=False, serialize=False):
        response = {
            "is_success": self.is_success,
            "message": self.message,
        }
        if self.data or show_empty:
            response_data = self.data
            if serialize:
                response_data = serializers.serialize("json", response_data)
            response['aData'] = response_data
        return response


