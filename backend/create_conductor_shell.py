from django.contrib.auth.models import User
from security.models import Profile, Conductor, Company, Branch, Role

# Obtener company/branch/role
company = Company.objects.filter(is_active=True).first()
branch = Branch.objects.filter(is_active=True).first()
role = Role.objects.filter(is_active=True).first()

# Crear usuario conductor
user, created = User.objects.get_or_create(
    username='conductor1',
    defaults={
        'email': 'conductor@tuky.com',
        'first_name': 'Juan',
        'last_name': 'Pérez',
        'is_active': True,
    }
)

if created:
    user.set_password('conductor123')
    user.save()
    print(f"✅ Usuario creado: {user.username}")
else:
    print(f"⚠️  Usuario ya existe: {user.username}")

# Crear perfil
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

print(f"✅ Perfil: is_conductor={profile.is_conductor}")

# Crear conductor
conductor, created = Conductor.objects.get_or_create(
    user=user,
    defaults={
        'estado': 'disponible',
        'ubicacion_lat': -2.170998,
        'ubicacion_lng': -79.922359,
        'calificacion_promedio': 4.8,
    }
)

print(f"✅ Conductor: estado={conductor.estado}")
print("\n🎉 LISTO - Login: conductor1 / conductor123")
