# -*- coding: utf-8 -*-
# from django.conf.urls import include, url
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.auth.decorators import login_required
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponseRedirect
from django.urls import re_path, include, path, reverse
from django.views.static import serve
from server import settings
from core.my_base import MY_ADMIN_URL

admin.autodiscover()

urlpatterns = static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += staticfiles_urlpatterns()


def protected_serve(request, path, document_root=None):
    try:
        return serve(request, path, document_root)
    except ObjectDoesNotExist:
        return HttpResponseRedirect("/?info=Ud. no tiene permisos para acceder a esta ruta")


if not settings.DEBUG:
    urlpatterns += [re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
                    re_path(r'^media/(?P<path>.*)$', protected_serve, {'document_root': settings.MEDIA_ROOT}),]


urlpatterns += [
    # path('o/', include('oauth2_provider.urls', namespace='oauth2_provider')),
    re_path(f'{MY_ADMIN_URL}', admin.site.urls),
    re_path(r'^api/security/', include('api.urls')),
]
