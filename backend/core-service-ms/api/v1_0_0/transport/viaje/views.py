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
            usuario = request.user
            viajes = Viaje.objects.filter(
                Q(pasajero=usuario) | Q(conductor=usuario)
            ).order_by('-fecha_solicitud')[:50]
            
            response = HelperResponse()
            response.set_success(True)
            response.set_status(status.HTTP_200_OK)
            response.set_data({
                'viajes': [
                    {
                        'id': v.id,
                        'estado': v.estado,
                        'origen': v.origen_direccion,
                        'destino': v.destino_direccion,
                        'precio': float(v.precio_solicitado),
                        'fecha': v.fecha_solicitud.isoformat(),
                    }
                    for v in viajes
                ]
            })
            return response.to_dict()
        except Exception as e:
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
            response.set_data({
                'viaje': {
                    'id': viaje.id,
                    'estado': viaje.estado,
                    'origen': {
                        'lat': float(viaje.origen_lat),
                        'lng': float(viaje.origen_lng),
                        'direccion': viaje.origen_direccion,
                    },
                    'destino': {
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
            viaje = Viaje.objects.get(pk=pk, conductor=request.user)
            precio_final = request.data.get('precio_final')
            
            if precio_final:
                viaje.precio_final = precio_final
            
            viaje.estado = 'completado'
            viaje.fecha_finalizacion = timezone.now()
            viaje.save()
            
            response = HelperResponse()
            response.set_success(True)
            response.set_status(status.HTTP_200_OK)
            response.set_message('Viaje completado')
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

