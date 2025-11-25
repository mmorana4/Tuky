from rest_framework.response import Response
from core.my_response import MyResponse
from rest_framework import status


class HelperResponse(MyResponse):

    def __init__(self):
        super(HelperResponse, self).__init__()
        self.template_name = None
        self.headers = None
        self.exception = False
        self.content_type = None
        self.forms = {}
        self.errors = {}
        self.datatable = {}
        self.code = status.HTTP_500_INTERNAL_SERVER_ERROR

    def set_form(self, name_key, arr_form):
        self.forms[name_key] = arr_form

    def set_errors(self, errors):
        self.errors = errors

    def set_headers(self, headers):
        self.headers = headers

    def set_template_name(self, template_name):
        self.template_name = template_name

    def set_exception(self, exception):
        self.exception = exception

    def set_content_type(self, content_type):
        self.content_type = content_type

    def get_forms(self):
        return self.forms

    def set_status(self, code):
        self.code = code

    def set_datatable(self, arr_data, recordsTotal, recordsFiltered):
        self.datatable = {
            'aaData': arr_data,
            'iTotalRecords': recordsTotal,
            'iTotalDisplayRecords': recordsFiltered
        }

    def to_dict(self, show_empty=False, **kwargs):
        response_dict = super(HelperResponse, self).to_dict(show_empty, **kwargs)

        if self.forms or show_empty:
            response_dict['forms'] = self.forms

        if self.errors:
            response_dict['errors'] = self.errors

        if self.datatable or show_empty:
            response_dict.update(self.datatable)

        response_kwargs = {
            'status': self.code,
            'data': response_dict,
            'headers': self.headers,
            'exception': self.exception,
            'content_type': self.content_type,
        }

        if self.template_name:
            response_kwargs['template_name'] = self.template_name

        return Response(**response_kwargs)
