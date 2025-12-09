from datetime import datetime, timedelta
from django.utils import timezone
from security.models import SolicitudViaje, Viaje
from helpers.service_helper import HelperService
from math import radians, cos, sin, asin, sqrt


class SolicitudViajeService(HelperService):
    
    def crear_solicitud(self, data, usuario):
        """Crea una nueva solicitud de viaje"""
        try:
            # Establecer fecha de expiración (por defecto 10 minutos)
            if 'fecha_expiracion' not in data or not data['fecha_expiracion']:
                data['fecha_expiracion'] = timezone.now() + timedelta(minutes=10)
            
            solicitud = SolicitudViaje.objects.create(
                pasajero=usuario,
                estado='solicitado',
                **data
            )
            self.set_success(True)
            self.set_message('Solicitud creada exitosamente')
            self.set_data({'id': solicitud.id})
            return self
        except Exception as e:
            self.set_success(False)
            self.set_message(str(e))
            return self
    
    def listar_solicitudes_disponibles(self, lat=None, lng=None, radio_km=5):
        """Lista solicitudes disponibles cerca de una ubicación"""
        
        def haversine(lat1, lon1, lat2, lon2):
            """Calcula distancia en km entre dos puntos usando Haversine"""
            R = 6371  # Radio de la Tierra en km
            lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
            dlat = lat2 - lat1
            dlon = lon2 - lon1
            a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
            c = 2 * asin(sqrt(a))
            return R * c
        
        try:
            solicitudes = SolicitudViaje.objects.filter(
                estado='solicitado',
                fecha_expiracion__gt=timezone.now()
            )
            
            solicitudes_cercanas = []
            
            if lat and lng:
                lat = float(lat)
                lng = float(lng)
                
                for solicitud in solicitudes:
                    distancia = haversine(
                        lat, lng,
                        float(solicitud.origen_lat),
                        float(solicitud.origen_lng)
                    )
                    
                    if distancia <= radio_km:
                        sol_dict = {
                            'id': solicitud.id,
                            'origen_lat': str(solicitud.origen_lat),
                            'origen_lng': str(solicitud.origen_lng),
                            'origen_direccion': solicitud.origen_direccion,
                            'destino_lat': str(solicitud.destino_lat),
                            'destino_lng': str(solicitud.destino_lng),
                            'destino_direccion': solicitud.destino_direccion,
                            'precio_solicitado': str(solicitud.precio_solicitado),
                            'metodo_pago': solicitud.metodo_pago,
                            'distancia': round(distancia, 2),
                        }
                        solicitudes_cercanas.append(sol_dict)
            else:
                # Si no hay ubicación, retornar todas
                for solicitud in solicitudes:
                    solicitudes_cercanas.append({
                        'id': solicitud.id,
                        'origen_lat': str(solicitud.origen_lat),
                        'origen_lng': str(solicitud.origen_lng),
                        'origen_direccion': solicitud.origen_direccion,
                        'destino_lat': str(solicitud.destino_lat),
                        'destino_lng': str(solicitud.destino_lng),
                        'destino_direccion': solicitud.destino_direccion,
                        'precio_solicitado': str(solicitud.precio_solicitado),
                        'metodo_pago': solicitud.metodo_pago,
                        'distancia': 0,
                    })
            
            self.set_success(True)
            self.set_data({'solicitudes': solicitudes_cercanas})
            return self
        except Exception as e:
            self.set_success(False)
            self.set_message(str(e))
            return self
    
    def aceptar_solicitud(self, solicitud_id, conductor, moto_id=None):
        """Un conductor acepta una solicitud de viaje"""
        try:
            solicitud = SolicitudViaje.objects.get(id=solicitud_id, estado='solicitado')
            
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
                viaje.save()
            
            # Actualizar estado de la solicitud
            solicitud.estado = 'aceptada'
            solicitud.save()
            
            self.set_success(True)
            self.set_message('Solicitud aceptada')
            self.set_data({'viaje_id': viaje.id})
            return self
        except SolicitudViaje.DoesNotExist:
            self.set_success(False)
            self.set_message('Solicitud no encontrada o ya fue aceptada')
            return self
        except Exception as e:
            self.set_success(False)
            self.set_message(str(e))
            return self
    
    def cancelar_solicitud(self, solicitud_id, usuario):
        """Cancela una solicitud de viaje"""
        try:
            solicitud = SolicitudViaje.objects.get(id=solicitud_id, pasajero=usuario)
            solicitud.estado = 'cancelada'
            solicitud.save()
            self.set_success(True)
            self.set_message('Solicitud cancelada')
            return self
        except SolicitudViaje.DoesNotExist:
            self.set_success(False)
            self.set_message('Solicitud no encontrada')
            return self
        except Exception as e:
            self.set_success(False)
            self.set_message(str(e))
            return self
