from core.my_response import MyResponse


class HelperService(MyResponse):

    def __init__(self, *args, **kwargs):
        super(HelperService, self).__init__()

    def get_data(self):
        return self.data
        
    def success_response(self, data):
        self.set_success(True)
        self.set_data(data)
        return self

    def error_response(self, message):
        self.set_success(False)
        self.set_message(message)
        return self
