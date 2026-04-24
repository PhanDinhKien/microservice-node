import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), 'apps/auth-service/.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🚀 Bắt đầu quá trình Seeding dữ liệu...');

  // 1. Danh sách Permissions với tên Tiếng Việt và Tiếng Anh rõ ràng
  const permissionsData = [
    { 
      key: 'all:all', 
      name_vi: 'Toàn quyền hệ thống', 
      name_en: 'Full System Access',
      action: 'ALL', 
      scope: 'ALL',
      description_vi: 'Cho phép thực hiện tất cả hành động trên mọi tài nguyên',
      description_en: 'Allows all actions on all resources'
    },
    { 
      key: 'user:read', 
      name_vi: 'Xem thông tin người dùng', 
      name_en: 'View User Information',
      action: 'READ', 
      scope: 'ALL',
      description_vi: 'Cho phép xem danh sách và chi tiết người dùng',
      description_en: 'Allows viewing user list and details'
    },
    { 
      key: 'user:create', 
      name_vi: 'Tạo mới người dùng', 
      name_en: 'Create New User',
      action: 'CREATE', 
      scope: 'ALL',
      description_vi: 'Cho phép đăng ký hoặc tạo tài khoản người dùng mới',
      description_en: 'Allows registering or creating new user accounts'
    },
    { 
      key: 'user:update', 
      name_vi: 'Cập nhật người dùng', 
      name_en: 'Update User Information',
      action: 'UPDATE', 
      scope: 'ALL',
      description_vi: 'Cho phép chỉnh sửa thông tin người dùng hiện có',
      description_en: 'Allows editing existing user information'
    },
    { 
      key: 'user:delete', 
      name_vi: 'Xóa người dùng', 
      name_en: 'Delete User',
      action: 'DELETE', 
      scope: 'ALL',
      description_vi: 'Cho phép xóa hoặc vô hiệu hóa tài khoản người dùng',
      description_en: 'Allows deleting or disabling user accounts'
    },
    { 
      key: 'role:manage', 
      name_vi: 'Quản lý vai trò và quyền', 
      name_en: 'Manage Roles and Permissions',
      action: 'MANAGE', 
      scope: 'ALL',
      description_vi: 'Cho phép tạo, sửa, xóa và gán quyền cho các vai trò',
      description_en: 'Allows creating, editing, deleting and assigning permissions to roles'
    },
  ];

  const createdPermissions: any[] = [];
  for (const p of permissionsData) {
    const permission = await prisma.permission.upsert({
      where: { permission_key: p.key },
      update: {
        name: { vi: p.name_vi, en: p.name_en },
        description: { vi: p.description_vi, en: p.description_en },
        action: p.action,
        scope: p.scope,
      },
      create: {
        permission_key: p.key,
        name: { vi: p.name_vi, en: p.name_en },
        description: { vi: p.description_vi, en: p.description_en },
        service_code: 'auth-service',
        action: p.action,
        scope: p.scope,
      },
    });
    createdPermissions.push(permission);
    console.log(`✅ Đã cập nhật quyền: ${p.key} (${p.name_vi})`);
  }

  // 2. Tạo hoặc cập nhật Role Administrator
  const adminRole = await prisma.role.upsert({
    where: { role_name: 'administrator' },
    update: {
      display_name: { vi: 'Quản trị viên tối cao', en: 'Super Administrator' },
      description: { vi: 'Người có toàn quyền quản lý hệ thống', en: 'User with full system management rights' },
      is_system: true,
    },
    create: {
      role_name: 'administrator',
      display_name: { vi: 'Quản trị viên tối cao', en: 'Super Administrator' },
      description: { vi: 'Người có toàn quyền quản lý hệ thống', en: 'User with full system management rights' },
      is_system: true,
    },
  });
  console.log(`⭐ Đã cập nhật vai trò: ${adminRole.role_name}`);

  // 3. Gán tất cả các permissions vừa tạo cho role Administrator
  for (const p of createdPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        role_id_permission_id: {
          role_id: adminRole.id,
          permission_id: p.id,
        },
      },
      update: {},
      create: {
        role_id: adminRole.id,
        permission_id: p.id,
      },
    });
  }
  console.log(`🔗 Đã gán ${createdPermissions.length} quyền cho vai trò ${adminRole.role_name}`);

  console.log('✨ Quá trình Seeding hoàn tất!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi trong quá trình seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
