import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')
django.setup()

from security.models import Company, CompanyBranch, Role, User, Profile
from helpers.choices_helper import HelperChoices

print("Starting user seeding...")

# 1. Company
try:
    company, _ = Company.objects.get_or_create(
        id=1,
        defaults={'ruc': '1234567890001', 'name': 'Tuky Motos', 'short_name': 'Tuky'}
    )
    print(f"Company: {company}")
except Exception as e:
    print(f"Error creating company: {e}")
    # Try to get existing if id=1 fails (though get_or_create handles it, maybe protected id issue)
    company = Company.objects.first()

# 2. Branch
try:
    branch, created = CompanyBranch.objects.get_or_create(
        company=company,
        is_main=True,
        defaults={'name': 'Matriz', 'short_name': 'MTZ', 'address': 'Ciudad', 'email': 'admin@tuky.com', 'is_active': True}
    )
    if not created and not branch.is_active:
        branch.is_active = True
        branch.save()
        print("Branch reactivated")
    print(f"Branch: {branch}")
except Exception as e:
    print(f"Error creating branch: {e}")
    branch = CompanyBranch.objects.filter(company=company).first()

# 3. Role
try:
    role, _ = Role.objects.get_or_create(
        code='ADMIN',
        defaults={
            'name': 'Administrador',
            'route': 'admin',
            'is_system': True,
            'level_authority': 'high',
            'legend': 'Rol de administrador del sistema'
        }
    )
    print(f"Role: {role}")
except Exception as e:
    print(f"Error creating role: {e}")
    role = Role.objects.filter(code='ADMIN').first()

# 4. User
try:
    user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@tuky.com',
            'first_name': 'Admin',
            'last_name': 'User',
            'document': '0999999999',
            'type_document': 1, # CI
            'is_staff': True,
            'is_superuser': True,
            'password': 'temp_password'
        }
    )
    if created:
        user.set_password('admin123')
        user.save()
        print("User 'admin' created with password 'admin123'")
    else:
        print("User 'admin' already exists. Resetting password to 'admin123'")
        user.set_password('admin123')
        user.save()
except Exception as e:
    print(f"Error creating user: {e}")
    user = User.objects.get(username='admin')

print(f"User: {user.username}")
print(f"Active: {user.is_active}")
print(f"Password set: {user.has_usable_password()}")

# 5. Profile
profile = None
try:
    profile, created = Profile.objects.get_or_create(
        user=user,
        role=role,
        branch=branch,
        defaults={'is_current': True, 'is_active': True}
    )
    if not created and (not profile.is_current or not profile.is_active):
        profile.is_current = True
        profile.is_active = True
        profile.save()
        print("Profile updated to be current and active")
    if created:
        print("Profile assigned to user")
    else:
        print("Profile already exists")
except Exception as e:
    print(f"Error creating profile: {e}")

print(f"Branches (after profile): {user.my_branches_current.count()}")
print(f"Roles (after profile): {user.my_roles_current.count()}")
print(f"Branch: {branch.name}, Active: {branch.is_active}, Current: {branch.is_current}")

# Direct Profile query
all_profiles = Profile.objects.filter(user=user)
print(f"Total profiles for user: {all_profiles.count()}")
for p in all_profiles:
    print(f"  - Profile: Role={p.role.code}, Branch={p.branch.name}, is_active={p.is_active}, is_current={p.is_current}")

if profile:
    print(f"Profile: User={profile.user.username}, Role={profile.role.code}, Branch={profile.branch.name}, Active={profile.is_active}, Current={profile.is_current}")

print("Seeding completed.")
