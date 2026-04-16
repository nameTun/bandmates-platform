import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../modules/users/entities/user.entity';

export const ROLES_KEY = 'roles';

// Gán danh sách các vai trò (UserRole) được phép truy cập vào Metadata của phương thức
// Sử dụng SetMetadata để lưu trữ mảng roles vào một nhãn (ROLES_KEY), giúp RolesGuard có thể kiểm tra quyền truy cập sau này
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
