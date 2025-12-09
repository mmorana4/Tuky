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
        import logging
        logger = logging.getLogger(__name__)
        
        with transaction.atomic():
            try:
                data = self.request.data
                logger.info(f"=== SOLICITUD CREATION DEBUG ===")
                logger.info(f"Received data: {data}")
                logger.info(f"User: {self.request.user}")
                
                form = SolicitudViajeForm(data=data)
                
                if not form.is_valid():
                    logger.error(f"Form validation failed!")
                    logger.error(f"Form errors: {form.errors}")
                    logger.error(f"Form errors as JSON: {form.errors.as_json()}")
                    from django.core.exceptions import ValidationError
                    raise ValidationError(f"Debe ingresar la información en todos los campos. Detalles: {form.errors.as_json()}")
                
                cleaned_data = form.cleaned_data
                logger.info(f"Cleaned data: {cleaned_data}")
                
                service = SolicitudViajeService()
                resultado = service.crear_solicitud(cleaned_data, self.request.user)
                
                if not resultado.is_success:
                    from django.core.exceptions import ValidationError
                    raise ValidationError(resultado.message)
                
                self.response.set_success(True)
                self.response.set_status(status.HTTP_201_CREATED)
                self.response.set_message('Solicitud de viaje creada correctamente')
                self.response.set_data(resultado.get_data())
                
            except Exception as e:
                import traceback
                traceback.print_exc()
                print(f"CRITICAL ERROR IN CREAR SOLICITUD: {e}")
                logger.exception("Exception during solicitud creation:")
                transaction.set_rollback(True)
                self.response.set_success(False)
                self.response.set_message(f"Error interno: {str(e)}")
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
                from django.core.exceptions import ValidationError
                raise ValidationError(resultado.message)
            
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
                    from django.core.exceptions import ValidationError
                    raise ValidationError(resultado.message)
                
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
    
    def obtener_estado(self, solicitud_id):
        """Obtiene el estado actual de una solicitud"""
        from security.models import SolicitudViaje, Viaje
        
        try:
            solicitud = SolicitudViaje.objects.get(id=solicitud_id)
            
            response_data = {
                'estado': solicitud.estado,
                'id': solicitud.id,
            }
            
            # Si está aceptada, buscar el viaje y datos del conductor
            if solicitud.estado == 'aceptada':
                try:
                    viaje = Viaje.objects.filter(
                        pasajero=solicitud.pasajero,
                        origen_lat=solicitud.origen_lat,
                        origen_lng=solicitud.origen_lng,
                    ).order_by('-fecha_aceptacion').first()
                    
                    if viaje and viaje.conductor:
                        from security.models import Conductor
                        try:
                            conductor_profile = Conductor.objects.get(user=viaje.conductor)
                            response_data['conductor'] = {
                                'nombre': f"{viaje.conductor.first_name} {viaje.conductor.last_name}",
                                'calificacion': str(conductor_profile.calificacion_promedio) if conductor_profile.calificacion_promedio else '5.0',
                            }
                            if viaje.moto:
                                response_data['conductor']['placa'] = viaje.moto.placa
                        except Conductor.DoesNotExist:
                            response_data['conductor'] = {
                                'nombre': f"{viaje.conductor.first_name} {viaje.conductor.last_name}",
                                'calificacion': '5.0',
                            }
                        
                        # Incluir viaje_id para navegación
                        response_data['viaje_id'] = viaje.id
                        
                        # Calcular ETA (distancia / velocidad)
                        # Por ahora retornamos un valor fijo, TODO: calcular real
                        response_data['eta_minutos'] = 5
                        
                except Viaje.DoesNotExist:
                    pass
            
            self.response.set_success(True)
            self.response.set_data(response_data)
            self.response.set_status(status.HTTP_200_OK)
            
        except SolicitudViaje.DoesNotExist:
            self.response.set_success(False)
            self.response.set_message('Solicitud no encontrada')
            self.response.set_status(status.HTTP_404_NOT_FOUND)
        except Exception as e:
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
                from django.core.exceptions import ValidationError
                raise ValidationError(resultado.message)
            
            self.response.set_success(True)
            self.response.set_status(status.HTTP_200_OK)
            self.response.set_message('Solicitud cancelada correctamente')
            
        except Exception as e:
            self.response.set_success(False)
            self.response.set_message(str(e))
            self.response.set_status(status.HTTP_400_BAD_REQUEST)
        
        return self.response.to_dict()




