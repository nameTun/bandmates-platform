import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../modules/users/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Lấy ra danh sách Roles được yêu cầu cho API này
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Nếu API không yêu cầu Role cụ thể nào -> Cho qua
    if (!requiredRoles) {
      return true;
    }

    // 2. Lấy user từ Request (được gắn vào bởi JwtAuthGuard - passport)
    const { user } = context.switchToHttp().getRequest();

    // 3. Kiểm tra xem Role của user có nằm trong danh sách được phép không
    return requiredRoles.some((role) => user.role === role);
  }
}
