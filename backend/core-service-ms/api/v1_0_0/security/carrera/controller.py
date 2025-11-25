from helpers.response_helper import HelperResponse
from rest_framework import status
from django.db import transaction


class CarreraController:

    def __init__(self, request):
        self.request = request
        self.response = HelperResponse()


    def datatable(self):
        from .service import CarreraService
        try:
            service = CarreraService(request=self.request)
            o_bus = service.datatable()
            if not o_bus.is_success:
                raise NameError(f"{o_bus.message}")
            data = o_bus.get_data()
            aaData = data.get('aaData')
            iTotalRecords = data.get("iTotalRecords", 0)
            iTotalDisplayRecords = data.get("iTotalDisplayRecords", 0)
            self.response.set_success(True)
            self.response.set_status(status.HTTP_200_OK)
            self.response.set_datatable(aaData, iTotalRecords, iTotalDisplayRecords)
        except Exception as e:
            self.response.set_success(False)
            self.response.set_status(status.HTTP_200_OK)
            self.response.set_message(str(e))
            self.response.set_datatable([], 0, 0)
        return self.response.to_dict()
    

    def load(self):
        from .service import CarreraService
        from .forms import CarreraForm
        try:
            id = self.request.data.get('id', 0)
            service = CarreraService(request=self.request)
            o_bus = service.load(id)
            if not o_bus.is_success:
                raise NameError(o_bus.message)
            data = o_bus.get_data()
            frm = CarreraForm(data=data.get('carrera', {}))
            if not frm.is_valid():
                raise NameError("Debe ingresar la información en todos los campos.")
            self.response.set_success(True)
            self.response.set_status(status.HTTP_200_OK)
            self.response.set_form('Carrera', frm.toArray())
        except Exception as e:
            self.response.set_success(False)
            self.response.set_status(status.HTTP_200_OK)
            self.response.set_message(str(e))
            self.response.set_form('Carrera', frm.toArray())
        return self.response.to_dict()

    def save(self):
        from .service import CarreraService
        from .forms import CarreraForm
        with transaction.atomic():
            try:
                data = self.request.data
                frm = CarreraForm(data=data.get('carrera', {}))
                if not frm.is_valid():
                    raise NameError("Debe ingresar la información en todos los campos.")
                cleaned_data = frm.to_dict()
                service = CarreraService(request=self.request)
                o_bus = service.save(cleaned_data)
                if not o_bus.is_success:
                    raise NameError(o_bus.message)
                data = o_bus.get_data()
                id = data.get('id', 0)
                frm.data['id'] = id
                self.response.set_success(True)
                self.response.set_form('Carrera', frm.toArray())
                self.response.set_status(status.HTTP_200_OK)
                self.response.set_message('Se guardo correctamente')    
            except Exception as e:
                transaction.set_rollback(True)
                self.response.set_success(False)
                self.response.set_message(str(e))
                self.response.set_form('Carrera', frm.toArray())
                self.response.set_status(status.HTTP_200_OK)
            return self.response.to_dict()
