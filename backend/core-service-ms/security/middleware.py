# middleware.py
class AuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Verificar si el usuario tiene sucursal y rol seleccionados
        # para rutas que lo requieran
        response = self.get_response(request)
        return response
