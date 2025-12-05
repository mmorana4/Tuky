import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')
django.setup()

from security.models import Company, CompanyBranch, Role, User, Profile

print("Creating admin user...")

# Get or create company
company = Company.objects.first()
if not company:
    company = Company.objects.create(ruc='1234567890001', name='Tuky Motos', short_name='Tuky')
print(f"Company: {company.name}")

# Get or create branch
branch = CompanyBranch.objects.filter(company=company, is_main=True).first()
if not branch:
    branch = CompanyBranch.objects.create(
        company=company,
        name='Matriz',
        short_name='MTZ',
        address='Ciudad',
        email='admin@tuky.com',
        is_main=True,
        is_current=True,
        is_active=True
    )
print(f"Branch: {branch.name}, Active: {branch.is_active}")

# Get or create role
role = Role.objects.filter(code='ADMIN').first()
if not role:
    role = Role.objects.create(
        code='ADMIN',
        name='Administrador',
        route='admin',
        is_system=True,
        level_authority='high',
        legend='Rol de administrador del sistema',
        is_active=True
    )
print(f"Role: {role.name}")

# Get or create user
user = User.objects.filter(username='admin').first()
if not user:
    user = User.objects.create(
        username='admin',
        email='admin@tuky.com',
        first_name='Admin',
        last_name='User',
        document='0999999999',
        type_document=1,
        is_staff=True,
        is_superuser=True,
        is_active=True
    )
    user.set_password('admin123')
    user.save()
    print(f"User created: {user.username}")
else:
    user.set_password('admin123')
    user.is_active = True
    user.save()
    print(f"User updated: {user.username}")

# Delete old profiles and create new one
Profile.objects.filter(user=user).delete()
profile = Profile.objects.create(
    user=user,
    role=role,
    branch=branch,
    is_current=True,
    is_active=True
)
print(f"Profile created: User={profile.user.username}, Role={profile.role.code}, Branch={profile.branch.name}")

print(f"\nFinal check:")
print(f"Branches: {user.my_branches_current.count()}")
print(f"Roles: {user.my_roles_current.count()}")

print("\nAdmin user ready!")
print("Username: admin")
print("Password: admin123")
