from datetime import datetime
import jwt
from helpers.response_helper import HelperResponse
from rest_framework import status


def login_required(f):
    def new_f(view, request):
        try:
            auth_header = request.headers.get('Authorization')
            if not auth_header:
                raise NameError(u'Token de autenticación faltante')
            token_parts = auth_header.split()
            if len(token_parts) != 2 or token_parts[0].lower() != 'bearer':
                raise NameError(u'Token de autenticación inválido')
            token = token_parts[1]
            return f(view, request)
        except Exception as ex:
            e_response = HelperResponse()
            e_response.set_status(code=status.HTTP_401_UNAUTHORIZED)
            e_response.set_message(message=f'Ocurrio un error: {ex.__str__()}')
            e_response.set_success(is_success=False)
            return e_response.to_dict()

    return new_f