from django.utils import timezone
from security.models import Conductor, User
from helpers.service_helper import HelperService


class ConductorService(HelperService):
    
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
            return self.success_response({'conductor': conductor})
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
        try:
            conductores = Conductor.objects.filter(
                estado='disponible',
                documentos_verificados=True,
                es_verificado=True
            )
            
            # TODO: Filtrar por distancia usando lat/lng y radio_km
            # Por ahora retornamos todos los disponibles
            
            return self.success_response({
                'conductores': list(conductores.values(
                    'id', 'user__first_name', 'user__last_name',
                    'calificacion_promedio', 'total_viajes',
                    'ubicacion_actual_lat', 'ubicacion_actual_lng'
                ))
            })
        except Exception as e:
            return self.error_response(str(e))


