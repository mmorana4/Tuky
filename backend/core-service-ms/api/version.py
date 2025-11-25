from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from helpers.response_helper import HelperResponse


class VersionView(APIView):

    def get(self, request):
        response = HelperResponse()
        response.set_success(is_success=True)
        response.set_status(code=status.HTTP_200_OK)
        response.set_message(message="API SEGURIDAD CORE")
        return response.to_dict()
