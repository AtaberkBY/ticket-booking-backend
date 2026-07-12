import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [
        UsersModule,
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService): JwtModuleOptions => { // <-- Dönüş tipini kesinleştirdik
                    const secret = configService.get<string>('JWT_SECRET_KEY');
                    const expiresIn = configService.get<string>('JWT_EXPIRATION');

                    if (!secret || !expiresIn) {
                        throw new Error('Fatal error: JWT_SECRET_KEY and/or JWT_EXPIRATION have not been defined.');
                    }

                        return {
                    secret: secret,
                    signOptions: {
                        expiresIn: expiresIn as Required<JwtModuleOptions>['signOptions']['expiresIn'],
                    },
                };
            },
        }),
    ],
    providers: [AuthService],
    controllers: [AuthController],
})
export class AuthModule {}
