from security.models import Moto, Conductor
from helpers.service_helper import HelperService


class MotoService(HelperService):
    
    def registrar_moto(self, data, usuario):
        """Registra una nueva moto"""
        try:
            # Verificar que el usuario sea conductor
            try:
                conductor = Conductor.objects.get(user=usuario)
            except Conductor.DoesNotExist:
                return self.error_response('Debe estar registrado como conductor para registrar una moto')
            
            moto = Moto.objects.create(
                conductor=usuario,
                **data
            )
            return self.success_response({'id': moto.id, 'moto': moto})
        except Exception as e:
            return self.error_response(str(e))
    
    def listar_motos(self, usuario):
        """Lista todas las motos del conductor"""
        try:
            motos = Moto.objects.filter(conductor=usuario).order_by('-created_at')
            return self.success_response({
                'motos': list(motos.values())
            })
        except Exception as e:
            return self.error_response(str(e))
    
    def obtener_moto(self, moto_id, usuario):
        """Obtiene los detalles de una moto específica"""
        try:
            moto = Moto.objects.get(id=moto_id, conductor=usuario)
            return self.success_response({'moto': moto})
        except Moto.DoesNotExist:
            return self.error_response('Moto no encontrada')
        except Exception as e:
            return self.error_response(str(e))
    
    def actualizar_moto(self, moto_id, data, usuario):
        """Actualiza los datos de una moto"""
        try:
            moto = Moto.objects.get(id=moto_id, conductor=usuario)
            for key, value in data.items():
                if hasattr(moto, key) and key != 'conductor':
                    setattr(moto, key, value)
            moto.save()
            return self.success_response({'moto': moto})
        except Moto.DoesNotExist:
            return self.error_response('Moto no encontrada')
        except Exception as e:
            return self.error_response(str(e))
    
    def eliminar_moto(self, moto_id, usuario):
        """Elimina una moto (soft delete)"""
        try:
            moto = Moto.objects.get(id=moto_id, conductor=usuario)
            moto.is_active = False
            moto.is_active_moto = False
            moto.save()
            return self.success_response({'mensaje': 'Moto eliminada'})
        except Moto.DoesNotExist:
            return self.error_response('Moto no encontrada')
        except Exception as e:
            return self.error_response(str(e))
    
    def activar_moto(self, moto_id, usuario):
        """Activa una moto (la marca como activa)"""
        try:
            moto = Moto.objects.get(id=moto_id, conductor=usuario)
            # Desactivar otras motos del conductor
            Moto.objects.filter(conductor=usuario, is_active_moto=True).update(is_active_moto=False)
            # Activar esta moto
            moto.is_active_moto = True
            moto.save()
            return self.success_response({'mensaje': 'Moto activada'})
        except Moto.DoesNotExist:
            return self.error_response('Moto no encontrada')
        except Exception as e:
            return self.error_response(str(e))
    
    def subir_foto(self, moto_id, foto, usuario):
        """Sube o actualiza la foto de una moto"""
        try:
            moto = Moto.objects.get(id=moto_id, conductor=usuario)
            moto.foto = foto
            moto.save()
            return self.success_response({'mensaje': 'Foto actualizada', 'foto_url': moto.foto.url if moto.foto else None})
        except Moto.DoesNotExist:
            return self.error_response('Moto no encontrada')
        except Exception as e:
            return self.error_response(str(e))


