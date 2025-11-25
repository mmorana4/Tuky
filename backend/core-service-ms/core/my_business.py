from server.settings import DEBUG


class MyBusiness:

    @staticmethod
    def get_token(request):
        # if DEBUG:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            raise NameError(u"Token invalido")
        token_parts = auth_header.split()
        if len(token_parts) != 2 or token_parts[0].lower() != 'bearer':
            raise NameError(u"Token invalido")
        return token_parts[1]
        # return None
