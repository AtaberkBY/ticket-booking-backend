import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
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
}