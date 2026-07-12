import { Injectable, BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
    constructor (
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService,
    ) {}

    async register(registerDto: RegisterDto) {
        const existingUser = await this.usersService.findByEmail(registerDto.email);
        if(existingUser){
            throw new BadRequestException('This email is already being used.');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(registerDto.password, salt);

        const user = await this.usersService.create({
            email: registerDto.email,
            password: hashedPassword,
        });

        const { password, ...result} = user

        return result;       
        }

    async login(loginDto: LoginDto){
        return this.validateUser(loginDto);
    }

    async generateTokens( userId: string, email: string, role: string) {
        const payload = { sub: userId, email, role};

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {expiresIn: '15m'}),
            this.jwtService.signAsync(payload, {expiresIn:'7d'}),
        ]);

        const salt = await bcrypt.genSalt(10);
        const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);
        try {
            await this.usersService.updateRefreshToken(userId, hashedRefreshToken);
        } catch (error) {
            throw new Error('An error occured during token-saving process');
        }


        return { accessToken, refreshToken };
    }

    async refreshTokens(userId: string, refreshToken: string){
        const user = await this.usersService.findById(userId);
        if(!user || !user.refreshToken) {
            throw new ForbiddenException('Access denided.');
        }

        const isTokenMatching = await bcrypt.compare(refreshToken, user.refreshToken);
        if(!isTokenMatching) {
            await this.usersService.updateRefreshToken(userId, null);
            throw new ForbiddenException('Security breach risk! Try to log in again');
        }

        return this.generateTokens(user.id, user.email, user.role);
    }

    async validateUser(loginDto: LoginDto): Promise<any> {
        const user = await this.usersService.findByEmail(loginDto.email);
        if(!user) {
            throw new UnauthorizedException('E-mail or password is incorrect.');
        }
        const isPasswordMatching = await bcrypt.compare(loginDto.password,user.password);
        if(!isPasswordMatching) {
            throw new UnauthorizedException('E-mail or password is incorrect');
        }
        return user;
    }
}