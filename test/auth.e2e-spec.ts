import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../src/users/users.service';
import * as bcrypt from 'bcrypt';

describe('AuthController (integration)', () => {
  let app: INestApplication;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;

  beforeAll(async () => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      updateRefreshToken: jest.fn(),
      findById: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn(),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('/auth/register (POST) should create a user and omit the password', async () => {
    (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
    (usersService.create as jest.Mock).mockResolvedValue({
      id: 'user-1',
      email: 'register@example.com',
      password: 'hashed-password',
      role: 'user',
    });

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'register@example.com', password: 'password1' })
      .expect(201);

    expect(response.body).toEqual({ id: 'user-1', email: 'register@example.com', role: 'user' });
    expect(usersService.create).toHaveBeenCalled();
  });

  it('/auth/login (POST) should return an access token and set a refresh cookie', async () => {
    const password = 'password1';
    const hashedPassword = await bcrypt.hash(password, 10);
    (usersService.findByEmail as jest.Mock).mockResolvedValue({
      id: 'user-1',
      email: 'login@example.com',
      password: hashedPassword,
      role: 'user',
    });
    (jwtService.signAsync as jest.Mock)
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'login@example.com', password })
      .expect(200);

    expect(response.body).toEqual({ accessToken: 'access-token', userId: 'user-1' });
    expect(response.headers['set-cookie'][0]).toContain('refreshToken=refresh-token');
  });

  it('/auth/refresh (POST) should refresh tokens when the refresh token is valid', async () => {
    const refreshToken = 'refresh-token';
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    (usersService.findById as jest.Mock).mockResolvedValue({
      id: 'user-1',
      email: 'refresh@example.com',
      role: 'user',
      refreshToken: hashedRefreshToken,
    });
    (jwtService.signAsync as jest.Mock)
      .mockResolvedValueOnce('new-access-token')
      .mockResolvedValueOnce('new-refresh-token');

    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ userId: 'user-1', refreshToken })
      .expect(200);

    expect(response.body).toEqual({ accessToken: 'new-access-token', refreshToken: 'new-refresh-token' });
  });
});
