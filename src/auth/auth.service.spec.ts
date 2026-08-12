import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';

jest.mock('bcrypt');
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      updateRefreshToken: jest.fn(),
      findById: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('throws when the email is already registered', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue({ id: '1', email: 'test@example.com' });

      await expect(
        authService.register({ email: 'test@example.com', password: 'password1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('returns a user without a password when registration succeeds', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
      (usersService.create as jest.Mock).mockResolvedValue({
        id: '2',
        email: 'new@example.com',
        password: 'hashedPassword',
        role: 'user',
      });

      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const result = await authService.register({ email: 'new@example.com', password: 'password1' });

      expect(result).toEqual({ id: '2', email: 'new@example.com', role: 'user' });
      expect(usersService.create).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'hashedPassword',
      });
    });
  });

  describe('validateUser', () => {
    it('throws if the user does not exist', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.validateUser({ email: 'missing@example.com', password: 'password1' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws if the password is invalid', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.validateUser({ email: 'test@example.com', password: 'password1' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns the user when credentials are valid', async () => {
      const user = { id: '1', email: 'test@example.com', password: 'hashedPassword' };
      (usersService.findByEmail as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.validateUser({ email: 'test@example.com', password: 'password1' });

      expect(result).toBe(user);
    });
  });

  describe('generateTokens', () => {
    it('creates access and refresh tokens and stores the hashed refresh token', async () => {
      (jwtService.signAsync as jest.Mock)
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-refresh');

      const result = await authService.generateTokens('1', 'test@example.com', 'user');

      expect(result).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' });
      expect(usersService.updateRefreshToken).toHaveBeenCalledWith('1', 'hashed-refresh');
    });
  });

  describe('refreshTokens', () => {
    it('throws when user is missing or refresh token is unset', async () => {
      (usersService.findById as jest.Mock).mockResolvedValue(null);

      await expect(authService.refreshTokens('1', 'token')).rejects.toThrow(ForbiddenException);
    });

    it('rejects when refresh tokens do not match', async () => {
      (usersService.findById as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        role: 'user',
        refreshToken: 'hashed-refresh',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.refreshTokens('1', 'refresh-token')).rejects.toThrow(ForbiddenException);
      expect(usersService.updateRefreshToken).toHaveBeenCalledWith('1', null);
    });

    it('returns new tokens when refresh token is valid', async () => {
      (usersService.findById as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        role: 'user',
        refreshToken: 'hashed-refresh',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jest.spyOn(authService, 'generateTokens').mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      const result = await authService.refreshTokens('1', 'refresh-token');

      expect(result).toEqual({ accessToken: 'new-access-token', refreshToken: 'new-refresh-token' });
    });
  });
});
