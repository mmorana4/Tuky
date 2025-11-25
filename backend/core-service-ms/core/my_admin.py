# -*- coding: utf-8 -*-
from django.utils.translation import gettext_lazy as _
from django.contrib import admin
from django.contrib.auth.models import Group
from core.my_base import MY_MANAGERS, MY_FIELDS_AUDIT

admin.site.site_header = _('ERP')
admin.site.site_title = _('Administración ERP')
admin.site.index_title = _('Panel de Control')

admin.site.unregister(Group)
# admin.site.unregister(User)


class CustomAdminSite:
    """Clase base para incluir media común en todos los admins"""

    class Media:
        css = {
            "all": ("admin/css/custom_global.css",)
        }
        js = (
            "admin/js/custom_global.js",
        )


class BaseModelTabularInlineAdmin(admin.TabularInline, CustomAdminSite):
    exclude = MY_FIELDS_AUDIT


class BaseModelStackedInlineAdmin(admin.StackedInline, CustomAdminSite):
    exclude = MY_FIELDS_AUDIT


class BaseModelAdmin(admin.ModelAdmin, CustomAdminSite):

    def get_actions(self, request):
        actions = super(BaseModelAdmin, self).get_actions(request)
        # if request.user.username not in [x[0] for x in MY_MANAGERS]:
        #     # del actions['delete_selected']
        return actions

    def has_add_permission(self, request):
        # return request.user.username in [x[0] for x in MY_MANAGERS]
        return True

    def has_change_permission(self, request, obj=None):
        return True

    def has_delete_permission(self, request, obj=None):
        # return request.user.username in [x[0] for x in MY_MANAGERS]
        return True

    def get_form(self, request, obj=None, **kwargs):
        self.exclude = MY_FIELDS_AUDIT
        form = super(BaseModelAdmin, self).get_form(request, obj, **kwargs)
        return form

    def save_model(self, request, obj, form, change):
        if request.user.username not in [x[0] for x in MY_MANAGERS]:
            raise Exception('Sin permiso a modificacion')
        else:
            obj.save()

    def id_display(self, obj):
        return f"COD-{obj.id:04d}"  # Formato personalizado, ejemplo: ID-0001

    id_display.short_description = "Código"  # Nombre de la columna en el admin
