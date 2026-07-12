import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class LoginDto{
    @IsEmail({}, {message:'An invalid email has been entered.'})
    @IsNotEmpty( {message:'Email field cannot be left empty.'})
    email: string = '';

    @IsNotEmpty({ message:'Password field cannot be left empty.'})
    password: string = '';
}