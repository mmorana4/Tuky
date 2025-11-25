from helpers.response_helper import HelperResponse
from rest_framework import status
from django.db import transaction


class CalificacionController:
    
    def __init__(self, request):
        self.request = request
        self.response = HelperResponse()
    
    def calificar(self):
        """Crea una nueva calificación"""
        from .service import CalificacionService
        from .forms import CalificacionForm
        
        with transaction.atomic():
            try:
                data = self.request.data
                form = CalificacionForm(data=data)
                
                if not form.is_valid():
                    raise NameError("Debe ingresar la información en todos los campos.")
                
                cleaned_data = form.cleaned_data
                service = CalificacionService(request=self.request)
                resultado = service.crear_calificacion(cleaned_data, self.request.user)
                
                if not resultado.is_success:
                    raise NameError(resultado.message)
                
                self.response.set_success(True)
                self.response.set_status(status.HTTP_201_CREATED)
                self.response.set_message('Calificación creada correctamente')
                self.response.set_data(resultado.get_data())
                
            except Exception as e:
                transaction.set_rollback(True)
                self.response.set_success(False)
                self.response.set_message(str(e))
                self.response.set_status(status.HTTP_400_BAD_REQUEST)
            
            return self.response.to_dict()
    
    def mis_calificaciones(self):
        """Obtiene las calificaciones que el usuario ha dado"""
        from .service import CalificacionService
        
        try:
            service = CalificacionService(request=self.request)
            resultado = service.obtener_mis_calificaciones(self.request.user)
            
            if not resultado.is_success:
                raise NameError(resultado.message)
            
            self.response.set_success(True)
            self.response.set_status(status.HTTP_200_OK)
            self.response.set_data(resultado.get_data())
            
        except Exception as e:
            self.response.set_success(False)
            self.response.set_message(str(e))
            self.response.set_status(status.HTTP_400_BAD_REQUEST)
        
        return self.response.to_dict()
    
    def recibidas(self):
        """Obtiene las calificaciones que el usuario ha recibido"""
        from .service import CalificacionService
        
        try:
            service = CalificacionService(request=self.request)
            resultado = service.obtener_calificaciones_recibidas(self.request.user)
            
            if not resultado.is_success:
                raise NameError(resultado.message)
            
            self.response.set_success(True)
            self.response.set_status(status.HTTP_200_OK)
            self.response.set_data(resultado.get_data())
            
        except Exception as e:
            self.response.set_success(False)
            self.response.set_message(str(e))
            self.response.set_status(status.HTTP_400_BAD_REQUEST)
        
        return self.response.to_dict()


