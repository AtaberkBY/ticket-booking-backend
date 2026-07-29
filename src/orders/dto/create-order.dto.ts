import { IsNotEmpty, IsUUID, IsNumber, Min } from "class-validator";

export class CreateOrderDto {
    @IsNotEmpty({ message: 'Ticket ID cannot be left empty.'})
    @IsUUID('4', {message:'Invalid Ticket ID format.'})
    ticketId!: string;

    @IsNotEmpty({ message: 'Quantity cannot be left empty.'})
    @IsNumber({}, {message:'Quantity must be a number.'})
    @Min(1, { message:'There must be at least one item in the cart.'})
    quantity!: number;
}