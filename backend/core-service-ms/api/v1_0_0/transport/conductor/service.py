from django.utils import timezone
from security.models import Conductor, User
from helpers.service_helper import HelperService
from math import radians, sin, cos, asin, sqrt


class ConductorService(HelperService):
    
    def __init__(self, *args, **kwargs):
        super(ConductorService, self).__init__()
    
    def registrar_conductor(self, data, usuario):
        """Registra un nuevo conductor"""
        try:
            # Verificar si ya es conductor
            if hasattr(usuario, 'conductor_profile'):
                return self.error_response('El usuario ya está registrado como conductor')
            
            conductor = Conductor.objects.create(
                user=usuario,
                **data
            )
            return self.success_response({'id': conductor.id, 'conductor': conductor})
        except Exception as e:
            return self.error_response(str(e))
    
    def obtener_perfil(self, usuario):
        """Obtiene el perfil del conductor"""
        try:
            conductor = Conductor.objects.get(user=usuario)
            conductor_data = {
                'id': conductor.id,
                'licencia_numero': conductor.licencia_numero,
                'telefono': conductor.telefono,
                'calificacion_promedio': str(conductor.calificacion_promedio),
                'total_viajes': conductor.total_viajes,
                'estado': conductor.estado,
                'documentos_verificados': conductor.documentos_verificados,
            }
            return self.success_response({'conductor': conductor_data})
        except Conductor.DoesNotExist:
            return self.error_response('El usuario no está registrado como conductor')
        except Exception as e:
            return self.error_response(str(e))
    
    def actualizar_perfil(self, data, usuario):
        """Actualiza el perfil del conductor"""
        try:
            conductor = Conductor.objects.get(user=usuario)
            for key, value in data.items():
                if hasattr(conductor, key):
                    setattr(conductor, key, value)
            conductor.save()
            return self.success_response({'conductor': conductor})
        except Conductor.DoesNotExist:
            return self.error_response('El usuario no está registrado como conductor')
        except Exception as e:
            return self.error_response(str(e))
    
    def actualizar_ubicacion(self, lat, lng, usuario):
        """Actualiza la ubicación del conductor en tiempo real"""
        try:
            conductor = Conductor.objects.get(user=usuario)
            conductor.ubicacion_actual_lat = lat
            conductor.ubicacion_actual_lng = lng
            conductor.ultima_actualizacion_ubicacion = timezone.now()
            conductor.save()
            return self.success_response({'mensaje': 'Ubicación actualizada'})
        except Conductor.DoesNotExist:
            return self.error_response('El usuario no está registrado como conductor')
        except Exception as e:
            return self.error_response(str(e))
    
    def cambiar_estado(self, nuevo_estado, usuario):
        """Cambia el estado del conductor (disponible/no disponible/en_viaje)"""
        try:
            conductor = Conductor.objects.get(user=usuario)
            estados_validos = ['disponible', 'en_viaje', 'no_disponible']
            if nuevo_estado not in estados_validos:
                return self.error_response(f'Estado inválido. Estados válidos: {estados_validos}')
            
            conductor.estado = nuevo_estado
            conductor.save()
            return self.success_response({'mensaje': f'Estado cambiado a {nuevo_estado}'})
        except Conductor.DoesNotExist:
            return self.error_response('El usuario no está registrado como conductor')
        except Exception as e:
            return self.error_response(str(e))
    
    def verificar_documentos(self, usuario):
        """Marca los documentos del conductor como verificados"""
        try:
            conductor = Conductor.objects.get(user=usuario)
            conductor.documentos_verificados = True
            conductor.es_verificado = True
            conductor.save()
            return self.success_response({'mensaje': 'Documentos verificados'})
        except Conductor.DoesNotExist:
            return self.error_response('El usuario no está registrado como conductor')
        except Exception as e:
            return self.error_response(str(e))
    
    def listar_conductores_disponibles(self, lat=None, lng=None, radio_km=5):
        """Lista conductores disponibles cerca de una ubicación"""
        
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
            # Solo retornar conductores que estén disponibles
            # No mostrar conductores en estado 'no_disponible' o 'en_viaje'
            conductores = Conductor.objects.filter(
                estado='disponible',  # Solo conductores disponibles
                documentos_verificados=True,
                es_verificado=True,
                ubicacion_actual_lat__isnull=False,
                ubicacion_actual_lng__isnull=False
            )
            
            # Log para verificar el filtro
            import logging
            logger = logging.getLogger(__name__)
            logger.info(f"🔍 Conductores disponibles encontrados: {conductores.count()}")
            
            conductores_cercanos = []
            
            if lat and lng:
                try:
                    lat = float(lat)
                    lng = float(lng)
                    radio_km = float(radio_km)
                    
                    for conductor in conductores:
                        if conductor.ubicacion_actual_lat and conductor.ubicacion_actual_lng:
                            distancia = haversine(
                                lat, lng,
                                float(conductor.ubicacion_actual_lat),
                                float(conductor.ubicacion_actual_lng)
                            )
                            if distancia <= radio_km:
                                conductores_cercanos.append({
                                    'id': conductor.id,
                                    'user__first_name': conductor.user.first_name,
                                    'user__last_name': conductor.user.last_name,
                                    'calificacion_promedio': str(conductor.calificacion_promedio),
                                    'total_viajes': conductor.total_viajes,
                                    'ubicacion_actual_lat': float(conductor.ubicacion_actual_lat),
                                    'ubicacion_actual_lng': float(conductor.ubicacion_actual_lng),
                                    'distancia_km': round(distancia, 2)
                                })
                except (ValueError, TypeError) as e:
                    return self.error_response(f'Error en coordenadas: {str(e)}')
            else:
                # Si no se proporcionan coordenadas, retornar todos los disponibles
                conductores_cercanos = [
                    {
                        'id': c.id,
                        'user__first_name': c.user.first_name,
                        'user__last_name': c.user.last_name,
                        'calificacion_promedio': str(c.calificacion_promedio),
                        'total_viajes': c.total_viajes,
                        'ubicacion_actual_lat': float(c.ubicacion_actual_lat) if c.ubicacion_actual_lat else None,
                        'ubicacion_actual_lng': float(c.ubicacion_actual_lng) if c.ubicacion_actual_lng else None,
                    }
                    for c in conductores
                ]
            
            return self.success_response({
                'conductores': conductores_cercanos,
                'total': len(conductores_cercanos)
            })
        except Exception as e:
            return self.error_response(str(e))




