from datetime import datetime, timedelta
from django.utils import timezone
from security.models import SolicitudViaje, Viaje
from helpers.service_helper import HelperService


class SolicitudViajeService(HelperService):
    
    def crear_solicitud(self, data, usuario):
        """Crea una nueva solicitud de viaje"""
        try:
            # Establecer fecha de expiración (por defecto 10 minutos)
            if 'fecha_expiracion' not in data or not data['fecha_expiracion']:
                data['fecha_expiracion'] = timezone.now() + timedelta(minutes=10)
            
            solicitud = SolicitudViaje.objects.create(
                pasajero=usuario,
                **data
            )
            return self.success_response({'id': solicitud.id, 'solicitud': solicitud})
        except Exception as e:
            return self.error_response(str(e))
    
    def listar_solicitudes_disponibles(self, lat=None, lng=None, radio_km=5):
        """Lista solicitudes disponibles cerca de una ubicación"""
        try:
            solicitudes = SolicitudViaje.objects.filter(
                estado='pendiente',
                fecha_expiracion__gt=timezone.now()
            )
            
            # TODO: Filtrar por distancia usando lat/lng y radio_km
            # Por ahora retornamos todas las pendientes
            
            return self.success_response({
                'solicitudes': list(solicitudes.values())
            })
        except Exception as e:
            return self.error_response(str(e))
    
    def aceptar_solicitud(self, solicitud_id, conductor, moto_id=None):
        """Un conductor acepta una solicitud de viaje"""
        try:
            solicitud = SolicitudViaje.objects.get(id=solicitud_id, estado='pendiente')
            
            # Crear el viaje
            viaje = Viaje.objects.create(
                pasajero=solicitud.pasajero,
                conductor=conductor,
                origen_lat=solicitud.origen_lat,
                origen_lng=solicitud.origen_lng,
                origen_direccion=solicitud.origen_direccion,
                destino_lat=solicitud.destino_lat,
                destino_lng=solicitud.destino_lng,
                destino_direccion=solicitud.destino_direccion,
                precio_solicitado=solicitud.precio_solicitado,
                metodo_pago=solicitud.metodo_pago,
                estado='aceptado',
                fecha_aceptacion=timezone.now()
            )
            
            if moto_id:
                from security.models import Moto
                moto = Moto.objects.get(id=moto_id, conductor=conductor)
                viaje.moto = moto
            
            # Actualizar estado de la solicitud
            solicitud.estado = 'aceptada'
            solicitud.save()
            
            return self.success_response({'viaje_id': viaje.id, 'viaje': viaje})
        except SolicitudViaje.DoesNotExist:
            return self.error_response('Solicitud no encontrada o ya fue aceptada')
        except Exception as e:
            return self.error_response(str(e))
    
    def cancelar_solicitud(self, solicitud_id, usuario):
        """Cancela una solicitud de viaje"""
        try:
            solicitud = SolicitudViaje.objects.get(id=solicitud_id, pasajero=usuario)
            solicitud.estado = 'cancelada'
            solicitud.save()
            return self.success_response({'mensaje': 'Solicitud cancelada'})
        except SolicitudViaje.DoesNotExist:
            return self.error_response('Solicitud no encontrada')
        except Exception as e:
            return self.error_response(str(e))


