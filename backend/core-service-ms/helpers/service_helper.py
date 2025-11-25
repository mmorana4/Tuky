from core.my_response import MyResponse


class HelperService(MyResponse):

    def __init__(self):
        super(HelperService, self).__init__()

    def get_data(self):
        return self.data
