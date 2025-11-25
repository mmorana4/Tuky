from django.db import transaction
from django.http import QueryDict
from rest_framework import status
from helpers.response_helper import HelperResponse


class CompanyBranchController:

    def __init__(self, request):
        self.request = request
        self.response = HelperResponse()

    def datatable(self):
        from .service import CompanyBranchService
        try:
            service = CompanyBranchService(self.request)
            o_bus = service.datatable()
            if not o_bus.is_success:
                raise NameError(o_bus.message)
            data = o_bus.get_data()
            aaData = data.get("aaData", [])
            iTotalRecords = data.get("iTotalRecords", 0)
            iTotalDisplayRecords = data.get("iTotalDisplayRecords", 0)
            self.response.set_success(True)
            self.response.set_status(status.HTTP_200_OK)
            self.response.set_datatable(aaData, iTotalRecords, iTotalDisplayRecords)
        except Exception as ex:
            self.response.set_success(False)
            self.response.set_status(status.HTTP_200_OK)
            self.response.set_message(f"{ex.__str__()}")
            self.response.set_datatable([], 0, 0)
        return self.response.to_dict()

    def companies(self):
        from .service import CompanyBranchService
        try:
            service = CompanyBranchService(self.request)
            o_bus = service.comapnies()
            if not o_bus.is_success:
                raise NameError(o_bus.message)
            data = o_bus.get_data()
            companies = data.get("companies", [])
            self.response.set_success(True)
            self.response.set_status(status.HTTP_200_OK)
            self.response.set_data({'companies': companies})
        except Exception as ex:
            self.response.set_success(False)
            self.response.set_status(status.HTTP_200_OK)
            self.response.set_message(f"{ex.__str__()}")
            self.response.set_data({'companies': []})
        return self.response.to_dict()

    def load(self):
        from .service import CompanyBranchService
        from .forms import CompanyBranchForm
        try:
            id = self.request.query_params.get('id', 0)
            service = CompanyBranchService(self.request)
            frm = CompanyBranchForm()
            o_bus = service.load(id)
            if not o_bus.is_success:
                raise NameError(o_bus.message)
            data = o_bus.get_data()
            frm.initial = data.get('company', {})
            self.response.set_success(True)
            self.response.set_form('CompanyBranch', frm.toArray())
            self.response.set_status(status.HTTP_200_OK)
        except Exception as ex:
            self.response.set_success(False)
            self.response.set_message(str(ex))
            self.response.set_form('CompanyBranch', frm.toArray())
            self.response.set_status(status.HTTP_200_OK)
        return self.response.to_dict()

    def save(self):
        from .service import CompanyBranchService
        from .forms import CompanyBranchForm
        with transaction.atomic():
            try:
                data = self.request.data
                files = None
                if 'multipart/form-data' in self.request.content_type:
                    data = self.request._request.POST
                    files = self.request._request.FILES
                if isinstance(data, QueryDict):
                    data = data.dict()
                frm = CompanyBranchForm(data)
                if not frm.is_valid():
                    raise NameError("Debe ingresar la información en todos los campos.")
                cleaned_data = frm.to_dict()
                service = CompanyBranchService(self.request)
                o_bus = service.save(cleaned_data)
                if not o_bus.is_success:
                    raise NameError(o_bus.message)
                data = o_bus.get_data()
                id = data.get('id', 0)
                frm.data['id'] = id
                self.response.set_success(True)
                self.response.set_form('Branch', frm.toArray())
                self.response.set_status(status.HTTP_200_OK)
                self.response.set_message('Se guardo correctamente')
            except Exception as ex:
                transaction.set_rollback(True)
                self.response.set_success(False)
                self.response.set_message(str(ex))
                self.response.set_form('Branch', frm.toArray())
                self.response.set_status(status.HTTP_200_OK)
            return self.response.to_dict()

    def delete(self):
        from .service import CompanyBranchService
        from .forms import CompanyBranchForm
        with transaction.atomic():
            try:
                id = self.request.data.get('id', 0)
                service = CompanyBranchService(self.request)
                o_bus = service.delete(id)
                if not o_bus.is_success:
                    raise NameError(o_bus.message)
                self.response.set_success(True)
                self.response.set_status(status.HTTP_200_OK)
                self.response.set_message('Se elimino correctamente')
            except Exception as ex:
                transaction.set_rollback(True)
                self.response.set_success(False)
                self.response.set_message(str(ex))
                self.response.set_status(status.HTTP_200_OK)
            return self.response.to_dict()
