import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings_dev')
django.setup()

from django.contrib.auth.models import User
from security.models import Profile, Company, Branch, Role, Conductor

def crear_conductor():
    """Crea un usuario conductor para testing"""
    
    # Obtener company/branch/role existentes
    company = Company.objects.filter(is_active=True).first()
    branch = Branch.objects.filter(is_active=True).first()
    role = Role.objects.filter(is_active=True).first()
    
    if not company or not branch or not role:
        print("❌ Error: No hay Company/Branch/Role activos")
        return
    
    # Verificar si ya existe
    if User.objects.filter(username='conductor1').exists():
        print("⚠️  Usuario 'conductor1' ya existe")
        user = User.objects.get(username='conductor1')
    else:
        # Crear usuario
        user = User.objects.create_user(
            username='conductor1',
            password='conductor123',
            email='conductor@tuky.com',
            first_name='Juan',
            last_name='Pérez',
            is_active=True,
            is_staff=False,
            is_superuser=False
        )
        print(f"✅ Usuario creado: {user.username}")
    
    # Crear o actualizar perfil
    profile, created = Profile.objects.get_or_create(
        user=user,
        defaults={
            'document': '0987654321',
            'type_document': 1,
            'is_conductor': True,
            'company': company,
            'branch': branch,
            'role': role,
        }
    )
    
    if not created:
        profile.is_conductor = True
        profile.save()
        print(f"✅ Perfil actualizado: is_conductor=True")
    else:
        print(f"✅ Perfil creado con is_conductor=True")
    
    # Crear registro de Conductor
    conductor, created = Conductor.objects.get_or_create(
        user=user,
        defaults={
            'estado': 'disponible',
            'ubicacion_lat': -2.170998,
            'ubicacion_lng': -79.922359,
            'calificacion_promedio': 4.8,
        }
    )
    
    if created:
        print(f"✅ Conductor creado con estado: {conductor.estado}")
    else:
        print(f"✅ Conductor ya existía: {conductor.estado}")
    
    print("\n" + "="*50)
    print("🎉 USUARIO CONDUCTOR LISTO")
    print("="*50)
    print(f"Username: conductor1")
    print(f"Password: conductor123")
    print(f"Perfil: {profile.is_conductor}")
    print(f"Estado: {conductor.estado}")
    print("="*50)

if __name__ == '__main__':
    crear_conductor()
