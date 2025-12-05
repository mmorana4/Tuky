from helpers.response_helper import HelperResponse
from rest_framework import status
from django.db import transaction


class MotoController:
    
    def __init__(self, request):
        self.request = request
        self.response = HelperResponse()
    
    def crear(self):
        """Crea una nueva moto"""
        from .service import MotoService
        from .forms import MotoForm
        
        with transaction.atomic():
            try:
                data = self.request.data
                form = MotoForm(data=data)
                
                if not form.is_valid():
                    raise NameError("Debe ingresar la información en todos los campos.")
                
                cleaned_data = form.cleaned_data
                service = MotoService(request=self.request)
                resultado = service.registrar_moto(cleaned_data, self.request.user)
                
                if not resultado.is_success:
                    raise NameError(resultado.message)
                
                self.response.set_success(True)
                self.response.set_status(status.HTTP_201_CREATED)
                self.response.set_message('Moto registrada correctamente')
                self.response.set_data(resultado.get_data())
                
            except Exception as e:
                transaction.set_rollback(True)
                self.response.set_success(False)
                self.response.set_message(str(e))
                self.response.set_status(status.HTTP_400_BAD_REQUEST)
            
            return self.response.to_dict()
    
    def listar(self):
        """Lista las motos del conductor"""
        from .service import MotoService
        
        try:
            service = MotoService(request=self.request)
            resultado = service.listar_motos(self.request.user)
            
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
    
    def detalle(self, pk):
        """Obtiene el detalle de una moto"""
        from .service import MotoService
        
        try:
            service = MotoService(request=self.request)
            resultado = service.obtener_moto(pk, self.request.user)
            
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
    
    def actualizar(self, pk):
        """Actualiza una moto"""
        from .service import MotoService
        from .forms import MotoForm
        
        with transaction.atomic():
            try:
                data = self.request.data
                form = MotoForm(data=data)
                
                if not form.is_valid():
                    raise NameError("Debe ingresar la información correctamente.")
                
                cleaned_data = form.cleaned_data
                service = MotoService(request=self.request)
                resultado = service.actualizar_moto(pk, cleaned_data, self.request.user)
                
                if not resultado.is_success:
                    raise NameError(resultado.message)
                
                self.response.set_success(True)
                self.response.set_status(status.HTTP_200_OK)
                self.response.set_message('Moto actualizada correctamente')
                self.response.set_data(resultado.get_data())
                
            except Exception as e:
                transaction.set_rollback(True)
                self.response.set_success(False)
                self.response.set_message(str(e))
                self.response.set_status(status.HTTP_400_BAD_REQUEST)
            
            return self.response.to_dict()
    
    def eliminar(self, pk):
        """Elimina una moto"""
        from .service import MotoService
        
        try:
            service = MotoService(request=self.request)
            resultado = service.eliminar_moto(pk, self.request.user)
            
            if not resultado.is_success:
                raise NameError(resultado.message)
            
            self.response.set_success(True)
            self.response.set_status(status.HTTP_200_OK)
            self.response.set_message('Moto eliminada correctamente')
            self.response.set_data(resultado.get_data())
            
        except Exception as e:
            self.response.set_success(False)
            self.response.set_message(str(e))
            self.response.set_status(status.HTTP_400_BAD_REQUEST)
        
        return self.response.to_dict()
    
    def activar(self, pk):
        """Activa una moto"""
        from .service import MotoService
        
        try:
            service = MotoService(request=self.request)
            resultado = service.activar_moto(pk, self.request.user)
            
            if not resultado.is_success:
                raise NameError(resultado.message)
            
            self.response.set_success(True)
            self.response.set_status(status.HTTP_200_OK)
            self.response.set_message('Moto activada correctamente')
            self.response.set_data(resultado.get_data())
            
        except Exception as e:
            self.response.set_success(False)
            self.response.set_message(str(e))
            self.response.set_status(status.HTTP_400_BAD_REQUEST)
        
        return self.response.to_dict()
    
    def subir_foto(self, pk):
        """Sube la foto de una moto"""
        from .service import MotoService
        
        try:
            if 'foto' not in self.request.FILES:
                raise NameError('Debe proporcionar una imagen')
            
            foto = self.request.FILES['foto']
            service = MotoService(request=self.request)
            resultado = service.subir_foto(pk, foto, self.request.user)
            
            if not resultado.is_success:
                raise NameError(resultado.message)
            
            self.response.set_success(True)
            self.response.set_status(status.HTTP_200_OK)
            self.response.set_message('Foto subida correctamente')
            self.response.set_data(resultado.get_data())
            
        except Exception as e:
            self.response.set_success(False)
            self.response.set_message(str(e))
            self.response.set_status(status.HTTP_400_BAD_REQUEST)
        
        return self.response.to_dict()




