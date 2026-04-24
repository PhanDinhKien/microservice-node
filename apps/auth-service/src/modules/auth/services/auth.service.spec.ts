import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UsersRepository } from '../../users/repositories/users.repository';
import { RefreshTokensRepository } from '../repositories/refresh-tokens.repository';

// Mock toàn bộ module bcrypt
jest.mock('bcrypt');

describe('AuthService - Core Security Logic', () => {
  let authService: AuthService;
  let usersRepository: UsersRepository;
  let jwtService: JwtService;
  let refreshTokensRepository: RefreshTokensRepository;

  // Mocking Dependencies
  const mockUsersRepository = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockRefreshTokensRepository = {
    create: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('mock-secret'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersRepository, useValue: mockUsersRepository },
        { provide: RefreshTokensRepository, useValue: mockRefreshTokensRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersRepository = module.get<UsersRepository>(UsersRepository);
    jwtService = module.get<JwtService>(JwtService);
    refreshTokensRepository = module.get<RefreshTokensRepository>(RefreshTokensRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Login Logic (Xác thực & Cấp quyền)', () => {
    it('nên đăng nhập thành công và trả về Token nếu thông tin đúng', async () => {
      // 1. Giả lập User tồn tại với quyền (permissions)
      const mockUser = {
        id: 'user-uuid',
        email: 'admin@example.com',
        password_hash: 'hashed_password',
        user_roles: [
          { role: { role_permissions: [{ permission: { permission_key: 'user:read' } }] } }
        ]
      };
      mockUsersRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('mock-jwt-token');

      // 2. Thực thi login
      const result = await authService.login({
        email: 'admin@example.com',
        password: 'password123'
      });

      // 3. Kiểm tra các điểm mấu chốt:
      // - Đã so sánh mật khẩu đúng chưa?
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
      // - Đã tạo token chưa?
      expect(jwtService.signAsync).toHaveBeenCalled();
      // - Đã lưu Refresh Token vào DB chưa?
      expect(mockRefreshTokensRepository.create).toHaveBeenCalled();
      // - Kết quả trả về có đủ data không?
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result.user.email).toBe('admin@example.com');
    });

    it('nên chặn đăng nhập nếu sai mật khẩu', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue({ password_hash: 'hashed' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login({ email: 'test@test.com', password: 'wrong' }))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Register Logic (Khởi tạo tài khoản)', () => {
    it('nên mã hóa mật khẩu khi đăng ký user mới', async () => {
      const registerDto = {
        email: 'new@test.com',
        password: 'password123',
        name: 'New User',
        phone_number: '0123'
      };

      mockUsersRepository.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_123');

      await authService.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockUsersRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        password_hash: 'hashed_123'
      }));
    });

    it('nên ném lỗi nếu email đã được sử dụng', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue({ id: 'exists' });
      
      await expect(authService.register({ email: 'exists@test.com' } as any))
        .rejects.toThrow(ConflictException);
    });
  });
});
