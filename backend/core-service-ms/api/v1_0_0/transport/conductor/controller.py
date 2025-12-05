from helpers.response_helper import HelperResponse
from rest_framework import status
from django.db import transaction


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
                    raise NameError("Debe ingresar la información en todos los campos.")
                
                cleaned_data = form.cleaned_data
                service = ConductorService(request=self.request)
                resultado = service.registrar_conductor(cleaned_data, self.request.user)
                
                if not resultado.is_success:
                    raise NameError(resultado.message)
                
                self.response.set_success(True)
                self.response.set_status(status.HTTP_201_CREATED)
                self.response.set_message('Conductor registrado correctamente')
                self.response.set_data(resultado.get_data())
                
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
                    raise NameError(resultado.message)
                
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
                raise NameError('Debe proporcionar latitud y longitud')
            
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
                raise NameError('Debe proporcionar el nuevo estado')
            
            service = ConductorService(request=self.request)
            resultado = service.cambiar_estado(nuevo_estado, self.request.user)
            
            if not resultado.is_success:
                raise NameError(resultado.message)
            
            self.response.set_success(True)
            self.response.set_status(status.HTTP_200_OK)
            self.response.set_message('Estado cambiado correctamente')
            self.response.set_data(resultado.get_data())
            
        except Exception as e:
            self.response.set_success(False)
            self.response.set_message(str(e))
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




