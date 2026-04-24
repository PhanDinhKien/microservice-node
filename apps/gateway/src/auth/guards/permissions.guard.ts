import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    console.log(requiredPermissions);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user || !user.permissions) {
      throw new ForbiddenException('Bạn không có quyền truy cập tài nguyên này');
    }

    const userPermissions: string[] = user.permissions;

    // Admin bypass: Nếu có quyền 'all:all' thì cho qua tất cả
    if (userPermissions.includes('all:all')) {
      return true;
    }

    // Kiểm tra xem user có chứa TẤT CẢ các quyền yêu cầu không
    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Bạn không có đủ quyền hạn để thực hiện hành động này');
    }

    return true;
  }
}
