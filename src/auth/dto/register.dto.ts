import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class RegisterDto {
    @IsEmail({}, { message:'An invalid email has been entered.'})
    @IsNotEmpty({ message: 'Email field cannot be left empty.'})
    email: string='';

    @IsNotEmpty({ message: 'Password field cannot be left empty.'})
    @MinLength(6, { message: 'Password must have at least 6 characters.'})
    password: string='';
}