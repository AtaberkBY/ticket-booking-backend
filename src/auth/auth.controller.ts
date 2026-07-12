import { Controller, Post, Body, HttpStatus, HttpCode, BadRequestException, Res, Req } from "@nestjs/common";
import type { Response, Request} from 'express';
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";


@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register') // /auth/register
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true}) response: Response
    ) {
        const user = await this.authService.login(loginDto);
        const tokens = await this.authService.generateTokens(user.id, user.email, user.role);

        response.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return {
            accessToken: tokens.accessToken,
            userId: user.id,
        };
    }
    

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Body('refreshToken') refreshToken: string, @Body('userId') userId: string){
        if(!refreshToken || !userId){
            throw new BadRequestException('Missing critical parameters');
        }
        return this.authService.refreshTokens(userId, refreshToken);
    }
}