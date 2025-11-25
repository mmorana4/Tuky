from helpers.response_helper import HelperResponse
from rest_framework import status
from django.db import transaction
from django.utils import timezone
from datetime import timedelta


class SolicitudViajeController:
    
    def __init__(self, request):
        self.request = request
        self.response = HelperResponse()
    
    def crear(self):
        """Crea una nueva solicitud de viaje"""
        from .service import SolicitudViajeService
        from .forms import SolicitudViajeForm
        
        with transaction.atomic():
            try:
                data = self.request.data
                form = SolicitudViajeForm(data=data)
                
                if not form.is_valid():
                    raise NameError("Debe ingresar la información en todos los campos.")
                
                cleaned_data = form.cleaned_data
                service = SolicitudViajeService(request=self.request)
                resultado = service.crear_solicitud(cleaned_data, self.request.user)
                
                if not resultado.is_success:
                    raise NameError(resultado.message)
                
                self.response.set_success(True)
                self.response.set_status(status.HTTP_201_CREATED)
                self.response.set_message('Solicitud de viaje creada correctamente')
                self.response.set_data(resultado.get_data())
                
            except Exception as e:
                transaction.set_rollback(True)
                self.response.set_success(False)
                self.response.set_message(str(e))
                self.response.set_status(status.HTTP_400_BAD_REQUEST)
            
            return self.response.to_dict()
    
    def listar_disponibles(self):
        """Lista solicitudes disponibles"""
        from .service import SolicitudViajeService
        
        try:
            lat = self.request.query_params.get('lat')
            lng = self.request.query_params.get('lng')
            radio = self.request.query_params.get('radio', 5)
            
            service = SolicitudViajeService(request=self.request)
            resultado = service.listar_solicitudes_disponibles(lat, lng, radio)
            
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
    
    def aceptar(self):
        """Un conductor acepta una solicitud"""
        from .service import SolicitudViajeService
        
        with transaction.atomic():
            try:
                solicitud_id = self.request.data.get('solicitud_id')
                moto_id = self.request.data.get('moto_id')
                
                service = SolicitudViajeService(request=self.request)
                resultado = service.aceptar_solicitud(
                    solicitud_id,
                    self.request.user,
                    moto_id
                )
                
                if not resultado.is_success:
                    raise NameError(resultado.message)
                
                self.response.set_success(True)
                self.response.set_status(status.HTTP_200_OK)
                self.response.set_message('Solicitud aceptada correctamente')
                self.response.set_data(resultado.get_data())
                
            except Exception as e:
                transaction.set_rollback(True)
                self.response.set_success(False)
                self.response.set_message(str(e))
                self.response.set_status(status.HTTP_400_BAD_REQUEST)
            
            return self.response.to_dict()
    
    def cancelar(self):
        """Cancela una solicitud"""
        from .service import SolicitudViajeService
        
        try:
            solicitud_id = self.request.data.get('solicitud_id')
            
            service = SolicitudViajeService(request=self.request)
            resultado = service.cancelar_solicitud(solicitud_id, self.request.user)
            
            if not resultado.is_success:
                raise NameError(resultado.message)
            
            self.response.set_success(True)
            self.response.set_status(status.HTTP_200_OK)
            self.response.set_message('Solicitud cancelada correctamente')
            
        except Exception as e:
            self.response.set_success(False)
            self.response.set_message(str(e))
            self.response.set_status(status.HTTP_400_BAD_REQUEST)
        
        return self.response.to_dict()


