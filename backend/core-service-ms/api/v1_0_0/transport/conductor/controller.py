from helpers.response_helper import HelperResponse
from rest_framework import status
from django.db import transaction
from django.core.exceptions import ValidationError


class ConductorController:
    
    def __init__(self, request):
        self.request = request
        self.response = HelperResponse()
    
    def registrar(self):
        """Registra un nuevo conductor"""
        from .service import ConductorService
        from .forms import ConductorForm
        
        with transaction.atomic():
            try:
                data = self.request.data
                form = ConductorForm(data=data)
                
                if not form.is_valid():
                    # Obtener errores específicos del formulario
                    errors = form.errors.as_data()
                    error_messages = []
                    for field, field_errors in errors.items():
                        for error in field_errors:
                            error_messages.append(f"{field}: {error.message}")
                    
                    if error_messages:
                        raise ValidationError(" ".join(error_messages))
                    else:
                        raise ValidationError("Debe completar todos los campos: teléfono, número de licencia y fecha de vencimiento.")
                
                cleaned_data = form.cleaned_data
                service = ConductorService(request=self.request)
                resultado = service.registrar_conductor(cleaned_data, self.request.user)
                
                if not resultado.is_success:
                    raise ValidationError(resultado.message)
                
                # Incluir información del usuario actualizado con el perfil
                from ..auth.serializers import UserSerializer
                usuario_actualizado = UserSerializer(self.request.user).data
                
                self.response.set_success(True)
                self.response.set_status(status.HTTP_201_CREATED)
                self.response.set_message('Conductor registrado correctamente')
                data_resultado = resultado.get_data()
                data_resultado['user'] = usuario_actualizado
                self.response.set_data(data_resultado)
                
            except Exception as e:
                transaction.set_rollback(True)
                self.response.set_success(False)
                self.response.set_message(str(e))
                self.response.set_status(status.HTTP_400_BAD_REQUEST)
            
            return self.response.to_dict()
    
    def perfil(self):
        """Obtiene el perfil del conductor"""
        from .service import ConductorService
        
        try:
            service = ConductorService(request=self.request)
            resultado = service.obtener_perfil(self.request.user)
            
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
    
    def actualizar(self):
        """Actualiza el perfil del conductor"""
        from .service import ConductorService
        from .forms import ConductorForm
        
        with transaction.atomic():
            try:
                data = self.request.data
                form = ConductorForm(data=data)
                
                if not form.is_valid():
                    raise NameError("Debe ingresar la información correctamente.")
                
                cleaned_data = form.cleaned_data
                service = ConductorService(request=self.request)
                resultado = service.actualizar_perfil(cleaned_data, self.request.user)
                
                if not resultado.is_success:
                    raise ValidationError(resultado.message)
                
                self.response.set_success(True)
                self.response.set_status(status.HTTP_200_OK)
                self.response.set_message('Perfil actualizado correctamente')
                self.response.set_data(resultado.get_data())
                
            except Exception as e:
                transaction.set_rollback(True)
                self.response.set_success(False)
                self.response.set_message(str(e))
                self.response.set_status(status.HTTP_400_BAD_REQUEST)
            
            return self.response.to_dict()
    
    def actualizar_ubicacion(self):
        """Actualiza la ubicación del conductor"""
        from .service import ConductorService
        
        try:
            lat = self.request.data.get('lat')
            lng = self.request.data.get('lng')
            
            if not lat or not lng:
                raise ValidationError('Debe proporcionar latitud y longitud')
            
            service = ConductorService(request=self.request)
            resultado = service.actualizar_ubicacion(float(lat), float(lng), self.request.user)
            
            if not resultado.is_success:
                raise NameError(resultado.message)
            
            self.response.set_success(True)
            self.response.set_status(status.HTTP_200_OK)
            self.response.set_message('Ubicación actualizada')
            self.response.set_data(resultado.get_data())
            
        except Exception as e:
            self.response.set_success(False)
            self.response.set_message(str(e))
            self.response.set_status(status.HTTP_400_BAD_REQUEST)
        
        return self.response.to_dict()
    
    def cambiar_estado(self):
        """Cambia el estado del conductor"""
        from .service import ConductorService
        
        try:
            nuevo_estado = self.request.data.get('estado')
            
            if not nuevo_estado:
                raise ValidationError('Debe proporcionar el nuevo estado')
            
            service = ConductorService(request=self.request)
            resultado = service.cambiar_estado(nuevo_estado, self.request.user)
            
            if not resultado.is_success:
                raise NameError(resultado.message)
            
            self.response.set_success(True)
            self.response.set_status(status.HTTP_200_OK)
            self.response.set_message('Estado cambiado correctamente')
            self.response.set_data(resultado.get_data())
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"CRITICAL ERROR IN CONDUCTOR CONTROLLER: {e}")
            self.response.set_success(False)
            self.response.set_message(f"Error interno: {str(e)}")
            self.response.set_status(status.HTTP_400_BAD_REQUEST)
        
        return self.response.to_dict()
    
    def verificar_documentos(self):
        """Verifica los documentos del conductor"""
        from .service import ConductorService
        
        try:
            service = ConductorService(request=self.request)
            resultado = service.verificar_documentos(self.request.user)
            
            if not resultado.is_success:
                raise NameError(resultado.message)
            
            self.response.set_success(True)
            self.response.set_status(status.HTTP_200_OK)
            self.response.set_message('Documentos verificados')
            self.response.set_data(resultado.get_data())
            
        except Exception as e:
            self.response.set_success(False)
            self.response.set_message(str(e))
            self.response.set_status(status.HTTP_400_BAD_REQUEST)
        
        return self.response.to_dict()
    
    def disponibles(self):
        """Lista conductores disponibles"""
        from .service import ConductorService
        
        try:
            lat = self.request.query_params.get('lat')
            lng = self.request.query_params.get('lng')
            radio = self.request.query_params.get('radio', 5)
            
            service = ConductorService(request=self.request)
            resultado = service.listar_conductores_disponibles(lat, lng, radio)
            
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




