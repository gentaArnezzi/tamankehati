import sys
sys.path.insert(0, 'apps/backend')

from users.models import User, UserRole
from users.serializers import UserOut

# Create a mock user
user = User()
user.id = 1
user.email = "test@kehati.org"
user.display_name = "Test User"
user.role = UserRole.super_admin
user.region_code = None
user.is_active = True

print(f"User: {user}")
print(f"User.role: {user.role}")
print(f"User.role type: {type(user.role)}")
print(f"User.role value: {user.role.value}")

# Try to serialize
try:
    user_out = UserOut.model_validate(user)
    print(f"\n✅ Serialization successful: {user_out}")
except Exception as e:
    print(f"\n❌ Serialization failed: {e}")
    import traceback
    traceback.print_exc()

