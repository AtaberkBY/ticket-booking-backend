import { IsNotEmpty, IsString, IsNumber, IsPositive, Min, IsDateString, MaxLength, IsOptional, IsDate } from "class-validator";

export class CreateTicketDto {
    @IsNotEmpty({ message:'Ticket title cannot be left empty.'})
    @IsString({ message:'Ticket title must be text-typed.'})
    @MaxLength(150, { message:'Ticket title can be maximum 150 characters.'})
    title: string = '';

    @IsOptional()
    @IsString({ message: 'Description must be text-typed.'})
    description?: string;

    @IsNotEmpty({ message: 'Price field cannot be left empty.'})
    @IsNumber({}, { message:'Price must be a valid number.'})
    @IsPositive({ message:'Price must be a number higher than 0.'})
    price: number = 0;

    @IsNotEmpty({ message:'Total-stock field cannot be left empty.'})
    @IsNumber({}, { message:'Total-stock must be a valid number.'})
    @Min(1, {message:'Total stock must be at least 1.'})
    totalStock: number = 0;

    @IsNotEmpty({ message:'Event date cannot be left empty.'})
    @IsDateString({}, { message:'Please use (yyyy-mm-dd) date format.'})
    eventDate: string = '';
}