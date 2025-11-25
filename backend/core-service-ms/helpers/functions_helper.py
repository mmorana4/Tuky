# -*- coding: utf-8 -*-
from __future__ import division
import random
import string
import unicodedata
import os
from typing import Union, Literal
from datetime import datetime, timedelta, date, time

unicode = str


class HelperFunctions(object):
    def __init__(self):
        pass

    @staticmethod
    def encrypt(value, use_encrypt=True):
        from django.core import signing
        try:
            encrypted = signing.dumps(value, compress=True)
            return f"ENC::{encrypted}" if use_encrypt else encrypted
        except Exception as ex:
            encrypted = signing.dumps(0, compress=True)
            return f"ENC::{encrypted}" if use_encrypt else encrypted

    @staticmethod
    def dencrypt(value, use_encrypt=True):
        from django.core import signing
        try:
            if value.startswith("ENC::") and use_encrypt:
                value = value.replace("ENC::", "", 1)
            return signing.loads(value)
        except Exception as ex:
            value = HelperFunctions.encrypt(0, use_encrypt)
            if value.startswith("ENC::") and use_encrypt:
                value = value.replace("ENC::", "", 1)
            return signing.loads(value)

    @staticmethod
    def generate_username(person_data, variant=1, max_length=50):
        from security.models import Person

        # Normalize and clean the name components
        def clean_name(name):
            if not name:
                return ""
            # Normalize unicode characters and convert to lowercase
            name = unicodedata.normalize('NFKD', name.lower()).encode('ascii', 'ignore').decode('ascii')
            # Remove special characters and keep only letters and numbers
            return ''.join(c for c in name if c.isalnum())

        # Get cleaned name components
        names_part = clean_name(person_data['names'].split(' ')[0]) if person_data['names'] else ''
        first_name = clean_name(person_data['first_name'])
        last_name = clean_name(person_data['last_name'])

        # Generate base username variants
        variants = [
            # Initial + first_name + last initial (most common)
            f"{names_part[0]}{first_name}{last_name[0]}" if last_name else f"{names_part[0]}{first_name}",
            # Firstname + last initial
            f"{first_name}{last_name[0]}" if last_name else first_name,
            # Firstname + last_name (if short)
            f"{first_name}{last_name}",
            # Initials + numbers
            f"{names_part[0]}{last_name[0]}{variant}" if last_name else f"{names_part[0]}{variant}"
        ]

        # Select the appropriate variant based on the current attempt
        if variant <= len(variants):
            username = variants[variant - 1]
        else:
            # After trying all variants, just combine with numbers
            base = f"{names_part[0]}{first_name[:3]}{last_name[0]}" if last_name else f"{names_part[0]}{first_name[:3]}"
            username = f"{base}{variant}"

        # Ensure the username isn't too long
        username = username[:max_length]

        # Check for uniqueness
        if not Person.objects.filter(username=username).exists():
            return username

        # If not unique, try again with next variant
        return HelperFunctions.generate_username(person_data, variant + 1, max_length)

    @staticmethod
    def null_to_decimal(valor, decimales=None):
        from decimal import Decimal, ROUND_HALF_UP
        """
        Convierte un valor a decimal con redondeo y manejo de None.

        Args:
            valor: Valor a convertir (puede ser int, float, str o None)
            decimales: Número de decimales para redondear (None para no redondear)

        Returns:
            float: Valor convertido y redondeado, o 0 si valor es None
        """
        if valor is None:
            return 0.0

        try:
            # Convertimos a Decimal primero para máxima precisión
            decimal_val = Decimal(str(valor))

            if decimales is not None:
                # Creamos el contexto de redondeo
                if decimales > 0:
                    # Redondeamos con la cantidad de decimales especificada
                    rounded = decimal_val.quantize(
                        Decimal('1.' + '0' * decimales),
                        rounding=ROUND_HALF_UP
                    )
                else:
                    # Redondeamos a entero
                    rounded = decimal_val.quantize(
                        Decimal('1'),
                        rounding=ROUND_HALF_UP
                    )
                return float(rounded)

            return float(decimal_val)

        except (TypeError, ValueError):
            # En caso de error en la conversión, devolvemos 0
            return 0.0

    @staticmethod
    def null_to_numeric(valor, decimales=None):
        if decimales:
            return round((valor if valor else 0), decimales)
        return valor if valor else 0

    @staticmethod
    def time_since_action(timestamp):
        now = datetime.now()
        delta = now - timestamp

        if delta < timedelta(minutes=1):
            return "hace un momento"
        elif delta < timedelta(hours=1):
            minutes = delta.seconds // 60
            return f"hace {minutes} minuto{'s' if minutes != 1 else ''}"
        elif delta < timedelta(days=1):
            hours = delta.seconds // 3600
            return f"hace {hours} hora{'s' if hours != 1 else ''}"
        days = delta.days
        return f"hace {days} día{'s' if days != 1 else ''}"

    @staticmethod
    def round_num_dec(value, decimales=2):
        from decimal import Decimal
        return Decimal(value).quantize(Decimal(10) ** (decimales * -1))

    @staticmethod
    def parse_date(date_str: str, format: Literal["DMY", "YMD", "MDY"] = "DMY") -> date:
        """
        Parses a date string using the given format:
        - DMY: Day-Month-Year
        - YMD: Year-Month-Day
        - MDY: Month-Day-Year
        The function automatically detects separators: '/', '-', or ':'.
        """
        for sep in ['/', '-', ':']:
            if sep in date_str:
                parts = date_str.split(sep)
                break
        else:
            raise ValueError("Unsupported date format or missing separator.")

        # Remove time part if exists
        parts = [p.split(' ')[0] for p in parts]

        try:
            if format == "DMY":
                day, month, year = map(int, parts)
            elif format == "YMD":
                year, month, day = map(int, parts)
            elif format == "MDY":
                month, day, year = map(int, parts)
            else:
                raise ValueError("Invalid format. Use 'DMY', 'YMD' or 'MDY'.")
            return date(year, month, day)
        except Exception:
            raise ValueError(f"Invalid date string: {date_str}")

    @staticmethod
    def parse_time(time_str: str) -> time:
        """
        Parses a time string in the format HH:MM and returns a `time` object.
        """
        try:
            hour, minute = map(int, time_str.split(':'))
            return time(hour, minute)
        except Exception:
            raise ValueError(f"Invalid time string: {time_str}")

    @staticmethod
    def format_date(dt: any, ft: str = "%d %b %Y") -> str:
        """
            Convierte una fecha (str, date o datetime) al formato 'DD Mon YYYY'.
            Ejemplo: '2024-11-15' -> '15 Nov 2024'
                     date(2024,11,15) -> '15 Nov 2024'
                     datetime(2024,11,15,10,30) -> '15 Nov 2024'
        """
        if isinstance(dt, str):
            # Intentamos parsear el string (formato ISO: YYYY-MM-DD)
            try:
                dt = datetime.strptime(dt, "%Y-%m-%d")
            except ValueError:
                raise ValueError("Formato de fecha inválido. Usa 'YYYY-MM-DD'")
        elif isinstance(dt, date) and not isinstance(dt, datetime):
            # Convertimos date a datetime
            dt = datetime.combine(dt, datetime.min.time())
        elif not isinstance(dt, datetime):
            raise TypeError("El parámetro debe ser str, date o datetime")

        return dt.strftime(ft)
