# -*- coding: utf-8 -*-
from django.db import models


class HelperChoices:
    class WeekDays(models.IntegerChoices):
        MONDAY = 1, 'LUNES'
        TUESDAY = 2, 'MARTES'
        WEDNESDAY = 3, 'MIÉRCOLES'
        THURSDAY = 4, 'JUEVES'
        FRIDAY = 5, 'VIERNES'
        SATURDAY = 6, 'SÁBADO'
        SUNDAY = 7, 'DOMINGO'

        @classmethod
        def get_abbreviated(cls):
            return {
                cls.MONDAY: 'LUN',
                cls.TUESDAY: 'MAR',
                cls.WEDNESDAY: 'MIÉ',
                cls.THURSDAY: 'JUE',
                cls.FRIDAY: 'VIE',
                cls.SATURDAY: 'SÁB',
                cls.SUNDAY: 'DOM'
            }

    class CalendarMonths(models.IntegerChoices):
        JANUARY = 1, 'ENERO'
        FEBRUARY = 2, 'FEBRERO'
        MARCH = 3, 'MARZO'
        APRIL = 4, 'ABRIL'
        MAY = 5, 'MAYO'
        JUNE = 6, 'JUNIO'
        JULY = 7, 'JULIO'
        AUGUST = 8, 'AGOSTO'
        SEPTEMBER = 9, 'SEPTIEMBRE'
        OCTOBER = 10, 'OCTUBRE'
        NOVEMBER = 11, 'NOVIEMBRE'
        DECEMBER = 12, 'DICIEMBRE'

        @classmethod
        def get_abbreviated(cls):
            return {
                cls.JANUARY: 'ENE',
                cls.FEBRUARY: 'FEB',
                cls.MARCH: 'MAR',
                cls.APRIL: 'ABR',
                cls.MAY: 'MAY',
                cls.JUNE: 'JUN',
                cls.JULY: 'JUL',
                cls.AUGUST: 'AGO',
                cls.SEPTEMBER: 'SEP',
                cls.OCTOBER: 'OCT',
                cls.NOVEMBER: 'NOV',
                cls.DECEMBER: 'DIC'
            }

    class MonthNumbers(models.IntegerChoices):
        ONE = 1, '1'
        TWO = 2, '2'
        THREE = 3, '3'
        FOUR = 4, '4'
        FIVE = 5, '5'
        SIX = 6, '6'
        SEVEN = 7, '7'
        EIGHT = 8, '8'
        NINE = 9, '9'
        TEN = 10, '10'
        ELEVEN = 11, '11'
        TWELVE = 12, '12'

    class RoleRoutes(models.TextChoices):
        ADMIN = 'admin', 'Sistema'
        EXECUTIVE = 'executive', 'Directivo'
        ADMINISTRATIVE = 'administrative', 'Administrativo'
        TEACHER = 'teacher', 'Profesor'
        STUDENT = 'student', 'Estudiante'

    class RoleLevelAuthorities(models.TextChoices):
        HIGH = 'high', 'Alto'
        MEDIUM = 'medium', 'Medio'
        LOW = 'low', 'Básico'

    class TypesDocument(models.IntegerChoices):
        CI = 1, "Cédula"
        PA = 2, "Pasaporte"
        RUC = 3, "RUC"

    class MenuItemTypes(models.TextChoices):
        CATEGORY = 'category', 'Categoría'
        MENU = 'menu', 'Menú'

    class AuthMethods(models.TextChoices):
        JWT = 'jwt', 'JWT'
        OAUTH2 = 'oauth2', 'OAUTH2'
        BOTH = 'both', 'Both'

    class AuthProviders(models.TextChoices):
        GOOGLE = 'google', 'Google'
        GITHUB = 'github', 'GitHub'
        MICROSOFT = 'microsoft', 'Microsoft'
