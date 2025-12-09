from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ViewSet
from django.utils import timezone
from django.db.models import Q
from security.models import Viaje
from helpers.response_helper import HelperResponse
from rest_framework import status


class ViajeView(ViewSet):
    permission_classes = (IsAuthenticated,)
    
    @action(methods=['get'], detail=False)
    def mis_viajes(self, request):
        """Obtiene los viajes del usuario (como pasajero o conductor)"""
        try:
            import logging
            logger = logging.getLogger(__name__)
            
            usuario = request.user
            logger.info(f"📋 Obteniendo viajes para usuario: {usuario.id} ({usuario.username})")
            
            # Obtener viajes donde el usuario es pasajero o conductor
            viajes = Viaje.objects.filter(
                Q(pasajero=usuario) | Q(conductor=usuario)
            ).order_by('-fecha_solicitud')[:50]
            
            logger.info(f"📋 Viajes encontrados: {viajes.count()}")
            
            viajes_data = []
            for v in viajes:
                # Determinar el rol del usuario en este viaje
                es_conductor = v.conductor == usuario if v.conductor else False
                es_pasajero = v.pasajero == usuario
                
                viaje_dict = {
                    'id': v.id,
                    'estado': v.estado,  # Estado real de la base de datos
                    'estado_display': v.get_estado_display(),  # Estado traducido (opcional)
                    'origen': v.origen_direccion,
                    'origen_direccion': v.origen_direccion,
                    'destino': v.destino_direccion,
                    'destino_direccion': v.destino_direccion,
                    'precio': float(v.precio_solicitado),
                    'precio_solicitado': float(v.precio_solicitado),
                    'precio_final': float(v.precio_final) if v.precio_final else None,
                    'fecha': v.fecha_solicitud.isoformat(),
                    'metodo_pago': v.metodo_pago,
                    'es_conductor': es_conductor,
                    'es_pasajero': es_pasajero,
                }
                
                logger.info(f"📋 Viaje {v.id}: estado={v.estado}, display={v.get_estado_display()}")
                
                # Agregar información del conductor si existe
                if v.conductor:
                    viaje_dict['conductor_id'] = v.conductor.id
                    viaje_dict['conductor_nombre'] = f"{v.conductor.first_name} {v.conductor.last_name}"
                
                # Agregar información del pasajero
                viaje_dict['pasajero_id'] = v.pasajero.id
                viaje_dict['pasajero_nombre'] = f"{v.pasajero.first_name} {v.pasajero.last_name}"
                
                viajes_data.append(viaje_dict)
            
            logger.info(f"✅ Retornando {len(viajes_data)} viajes")
            
            response = HelperResponse()
            response.set_success(True)
            response.set_status(status.HTTP_200_OK)
            response.set_data({'viajes': viajes_data})
            return response.to_dict()
        except Exception as e:
            import traceback
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"❌ Error en mis_viajes: {e}")
            logger.error(traceback.format_exc())
            response = HelperResponse()
            response.set_success(False)
            response.set_message(str(e))
            response.set_status(status.HTTP_400_BAD_REQUEST)
            return response.to_dict()
    
    @action(methods=['get'], detail=True)
    def detalle(self, request, pk=None):
        """Obtiene el detalle de un viaje específico"""
        try:
            viaje = Viaje.objects.get(pk=pk)
            usuario = request.user
            
            # Verificar que el usuario tenga acceso al viaje
            if viaje.pasajero != usuario and viaje.conductor != usuario:
                raise NameError('No tiene permiso para ver este viaje')
            
            response = HelperResponse()
            response.set_success(True)
            response.set_status(status.HTTP_200_OK)
            # Obtener información del conductor si existe
            conductor_data = None
            if viaje.conductor:
                from security.models import Conductor
                try:
                    conductor_profile = Conductor.objects.get(user=viaje.conductor)
                    conductor_data = {
                        'id': viaje.conductor.id,
                        'nombre': f"{viaje.conductor.first_name} {viaje.conductor.last_name}",
                        'calificacion': str(conductor_profile.calificacion_promedio) if conductor_profile.calificacion_promedio else '5.0',
                        'ubicacion_actual': {
                            'lat': float(conductor_profile.ubicacion_actual_lat) if conductor_profile.ubicacion_actual_lat else None,
                            'lng': float(conductor_profile.ubicacion_actual_lng) if conductor_profile.ubicacion_actual_lng else None,
                        } if conductor_profile.ubicacion_actual_lat and conductor_profile.ubicacion_actual_lng else None,
                    }
                    if viaje.moto:
                        conductor_data['placa'] = viaje.moto.placa
                except Conductor.DoesNotExist:
                    conductor_data = {
                        'id': viaje.conductor.id,
                        'nombre': f"{viaje.conductor.first_name} {viaje.conductor.last_name}",
                    }
            
            response.set_data({
                'viaje': {
                    'id': viaje.id,
                    'estado': viaje.estado,
                    'conductor': conductor_data,
                    'origen': {
                        'latitude': float(viaje.origen_lat),
                        'longitude': float(viaje.origen_lng),
                        'lat': float(viaje.origen_lat),
                        'lng': float(viaje.origen_lng),
                        'direccion': viaje.origen_direccion,
                    },
                    'destino': {
                        'latitude': float(viaje.destino_lat),
                        'longitude': float(viaje.destino_lng),
                        'lat': float(viaje.destino_lat),
                        'lng': float(viaje.destino_lng),
                        'direccion': viaje.destino_direccion,
                    },
                    'precio_solicitado': float(viaje.precio_solicitado),
                    'precio_final': float(viaje.precio_final) if viaje.precio_final else None,
                    'metodo_pago': viaje.metodo_pago,
                    'fecha_solicitud': viaje.fecha_solicitud.isoformat(),
                }
            })
            return response.to_dict()
        except Viaje.DoesNotExist:
            response = HelperResponse()
            response.set_success(False)
            response.set_message('Viaje no encontrado')
            response.set_status(status.HTTP_404_NOT_FOUND)
            return response.to_dict()
        except Exception as e:
            response = HelperResponse()
            response.set_success(False)
            response.set_message(str(e))
            response.set_status(status.HTTP_400_BAD_REQUEST)
            return response.to_dict()
    
    @action(methods=['post'], detail=True)
    def en_camino_origen(self, request, pk=None):
        """Conductor va hacia el origen"""
        try:
            viaje = Viaje.objects.get(pk=pk, conductor=request.user)
            viaje.estado = 'en_camino_origen'
            viaje.save()
            
            response = HelperResponse()
            response.set_success(True)
            response.set_status(status.HTTP_200_OK)
            response.set_message('Estado actualizado: En camino al origen')
            return response.to_dict()
        except Viaje.DoesNotExist:
            response = HelperResponse()
            response.set_success(False)
            response.set_message('Viaje no encontrado')
            response.set_status(status.HTTP_404_NOT_FOUND)
            return response.to_dict()
        except Exception as e:
            response = HelperResponse()
            response.set_success(False)
            response.set_message(str(e))
            response.set_status(status.HTTP_400_BAD_REQUEST)
            return response.to_dict()
    
    @action(methods=['post'], detail=True)
    def llegar_origen(self, request, pk=None):
        """Conductor llegó al origen"""
        try:
            viaje = Viaje.objects.get(pk=pk, conductor=request.user)
            viaje.estado = 'llegado_origen'
            viaje.save()
            
            response = HelperResponse()
            response.set_success(True)
            response.set_status(status.HTTP_200_OK)
            response.set_message('Estado actualizado: Llegado al origen')
            return response.to_dict()
        except Viaje.DoesNotExist:
            response = HelperResponse()
            response.set_success(False)
            response.set_message('Viaje no encontrado')
            response.set_status(status.HTTP_404_NOT_FOUND)
            return response.to_dict()
        except Exception as e:
            response = HelperResponse()
            response.set_success(False)
            response.set_message(str(e))
            response.set_status(status.HTTP_400_BAD_REQUEST)
            return response.to_dict()
    
    @action(methods=['post'], detail=True)
    def iniciar(self, request, pk=None):
        """Inicia un viaje (cambia estado a 'en_viaje')"""
        try:
            viaje = Viaje.objects.get(pk=pk, conductor=request.user)
            viaje.estado = 'en_viaje'
            viaje.fecha_inicio = timezone.now()
            viaje.save()
            
            response = HelperResponse()
            response.set_success(True)
            response.set_status(status.HTTP_200_OK)
            response.set_message('Viaje iniciado')
            return response.to_dict()
        except Viaje.DoesNotExist:
            response = HelperResponse()
            response.set_success(False)
            response.set_message('Viaje no encontrado')
            response.set_status(status.HTTP_404_NOT_FOUND)
            return response.to_dict()
        except Exception as e:
            response = HelperResponse()
            response.set_success(False)
            response.set_message(str(e))
            response.set_status(status.HTTP_400_BAD_REQUEST)
            return response.to_dict()
    
    @action(methods=['post'], detail=True)
    def completar(self, request, pk=None):
        """Completa un viaje"""
        try:
            import logging
            logger = logging.getLogger(__name__)
            
            logger.info(f"🔄 Completando viaje {pk} por usuario {request.user.id}")
            
            # Verificar que el viaje existe
            try:
                viaje = Viaje.objects.get(pk=pk)
            except Viaje.DoesNotExist:
                response = HelperResponse()
                response.set_success(False)
                response.set_message('Viaje no encontrado')
                response.set_status(status.HTTP_404_NOT_FOUND)
                return response.to_dict()
            
            # Verificar permisos: debe ser el conductor
            if viaje.conductor != request.user:
                response = HelperResponse()
                response.set_success(False)
                response.set_message('Solo el conductor puede completar el viaje')
                response.set_status(status.HTTP_403_FORBIDDEN)
                return response.to_dict()
            
            # Verificar que el viaje está en un estado válido para completar
            if viaje.estado not in ['en_viaje', 'llegado_origen']:
                response = HelperResponse()
                response.set_success(False)
                response.set_message(f'No se puede completar un viaje en estado: {viaje.estado}')
                response.set_status(status.HTTP_400_BAD_REQUEST)
                return response.to_dict()
            
            precio_final = request.data.get('precio_final')
            
            # Actualizar precio final si se proporciona
            if precio_final is not None:
                try:
                    precio_final = float(precio_final)
                    if precio_final > 0:
                        viaje.precio_final = precio_final
                        logger.info(f"💰 Precio final actualizado: {precio_final}")
                except (ValueError, TypeError):
                    logger.warning(f"⚠️ Precio final inválido: {precio_final}, usando precio solicitado")
            
            # Actualizar estado del viaje
            viaje.estado = 'completado'
            viaje.fecha_finalizacion = timezone.now()
            viaje.save()
            
            # Actualizar estado del conductor a disponible
            from security.models import Conductor
            try:
                conductor = Conductor.objects.get(user=viaje.conductor)
                conductor.estado = 'disponible'
                conductor.save()
                logger.info(f"✅ Conductor {conductor.id} actualizado a disponible")
            except Conductor.DoesNotExist:
                logger.warning(f"⚠️ No se encontró perfil de conductor para {viaje.conductor.id}")
            
            logger.info(f"✅ Viaje {pk} completado exitosamente")
            
            response = HelperResponse()
            response.set_success(True)
            response.set_status(status.HTTP_200_OK)
            response.set_message('Viaje completado exitosamente')
            response.set_data({
                'viaje_id': viaje.id,
                'estado': viaje.estado,
                'precio_final': float(viaje.precio_final) if viaje.precio_final else None,
            })
            return response.to_dict()
        except Exception as e:
            import traceback
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"❌ Error al completar viaje: {e}")
            logger.error(traceback.format_exc())
            response = HelperResponse()
            response.set_success(False)
            response.set_message(str(e))
            response.set_status(status.HTTP_400_BAD_REQUEST)
            return response.to_dict()
    
    @action(methods=['post'], detail=True)
    def cancelar(self, request, pk=None):
        """Cancela un viaje"""
        try:
            viaje = Viaje.objects.get(pk=pk)
            usuario = request.user
            
            # Solo el pasajero o conductor pueden cancelar
            if viaje.pasajero != usuario and viaje.conductor != usuario:
                raise NameError('No tiene permiso para cancelar este viaje')
            
            viaje.estado = 'cancelado'
            viaje.save()
            
            response = HelperResponse()
            response.set_success(True)
            response.set_status(status.HTTP_200_OK)
            response.set_message('Viaje cancelado')
            return response.to_dict()
        except Viaje.DoesNotExist:
            response = HelperResponse()
            response.set_success(False)
            response.set_message('Viaje no encontrado')
            response.set_status(status.HTTP_404_NOT_FOUND)
            return response.to_dict()
        except Exception as e:
            response = HelperResponse()
            response.set_success(False)
            response.set_message(str(e))
            response.set_status(status.HTTP_400_BAD_REQUEST)
            return response.to_dict()

