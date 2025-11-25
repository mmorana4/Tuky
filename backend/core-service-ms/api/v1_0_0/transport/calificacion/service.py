from django.db.models import Avg
from security.models import Calificacion, Viaje, Conductor
from helpers.service_helper import HelperService


class CalificacionService(HelperService):
    
    def crear_calificacion(self, data, calificador):
        """Crea una nueva calificación"""
        try:
            viaje_id = data.get('viaje')
            calificado_id = data.get('calificado')
            puntuacion = data.get('puntuacion')
            comentario = data.get('comentario', '')
            
            # Verificar que el viaje existe y el usuario tiene acceso
            viaje = Viaje.objects.get(id=viaje_id)
            if viaje.pasajero != calificador and viaje.conductor != calificador:
                return self.error_response('No tiene permiso para calificar este viaje')
            
            # Verificar que el calificado es el otro participante del viaje
            if viaje.pasajero == calificador:
                calificado_real = viaje.conductor
            else:
                calificado_real = viaje.pasajero
            
            if calificado_real.id != calificado_id:
                return self.error_response('El usuario calificado no corresponde al viaje')
            
            # Verificar que no haya calificado antes
            if Calificacion.objects.filter(viaje=viaje, calificador=calificador).exists():
                return self.error_response('Ya calificaste este viaje')
            
            # Crear la calificación
            calificacion = Calificacion.objects.create(
                viaje=viaje,
                calificador=calificador,
                calificado=calificado_real,
                puntuacion=puntuacion,
                comentario=comentario
            )
            
            # Actualizar calificación promedio del conductor si es conductor el calificado
            if hasattr(calificado_real, 'conductor_profile'):
                self._actualizar_calificacion_promedio(calificado_real)
            
            # Actualizar calificaciones en el viaje
            if viaje.pasajero == calificador:
                viaje.calificacion_conductor = puntuacion
                viaje.comentario_conductor = comentario
            else:
                viaje.calificacion_pasajero = puntuacion
                viaje.comentario_pasajero = comentario
            viaje.save()
            
            return self.success_response({'id': calificacion.id, 'calificacion': calificacion})
        except Viaje.DoesNotExist:
            return self.error_response('Viaje no encontrado')
        except Exception as e:
            return self.error_response(str(e))
    
    def _actualizar_calificacion_promedio(self, usuario):
        """Actualiza la calificación promedio del conductor"""
        try:
            conductor = Conductor.objects.get(user=usuario)
            promedio = Calificacion.objects.filter(
                calificado=usuario
            ).aggregate(promedio=Avg('puntuacion'))['promedio']
            
            if promedio:
                conductor.calificacion_promedio = round(promedio, 2)
                conductor.save()
        except Conductor.DoesNotExist:
            pass
        except Exception as e:
            print(f"Error al actualizar calificación promedio: {e}")
    
    def obtener_mis_calificaciones(self, usuario):
        """Obtiene las calificaciones que el usuario ha dado"""
        try:
            calificaciones = Calificacion.objects.filter(
                calificador=usuario
            ).select_related('viaje', 'calificado').order_by('-fecha_calificacion')
            
            return self.success_response({
                'calificaciones': [
                    {
                        'id': c.id,
                        'viaje_id': c.viaje.id,
                        'calificado': {
                            'id': c.calificado.id,
                            'nombre': c.calificado.get_full_name()
                        },
                        'puntuacion': c.puntuacion,
                        'comentario': c.comentario,
                        'fecha': c.fecha_calificacion.isoformat()
                    }
                    for c in calificaciones
                ]
            })
        except Exception as e:
            return self.error_response(str(e))
    
    def obtener_calificaciones_recibidas(self, usuario):
        """Obtiene las calificaciones que el usuario ha recibido"""
        try:
            calificaciones = Calificacion.objects.filter(
                calificado=usuario
            ).select_related('viaje', 'calificador').order_by('-fecha_calificacion')
            
            promedio = calificaciones.aggregate(promedio=Avg('puntuacion'))['promedio']
            
            return self.success_response({
                'calificaciones': [
                    {
                        'id': c.id,
                        'viaje_id': c.viaje.id,
                        'calificador': {
                            'id': c.calificador.id,
                            'nombre': c.calificador.get_full_name()
                        },
                        'puntuacion': c.puntuacion,
                        'comentario': c.comentario,
                        'fecha': c.fecha_calificacion.isoformat()
                    }
                    for c in calificaciones
                ],
                'promedio': round(promedio, 2) if promedio else 0,
                'total': calificaciones.count()
            })
        except Exception as e:
            return self.error_response(str(e))


