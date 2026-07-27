import { PartialType } from '@nestjs/mapped-types';
import { IsDateString, IsNumber, IsOptional, IsPositive, IsString, MaxLength, Min } from 'class-validator';
import { CreateTicketDto } from './create-ticket.dto';

export class UpdateTicketDto extends PartialType(CreateTicketDto) {
  @IsOptional()
  @IsString({ message: 'Ticket title must be text-typed.' })
  @MaxLength(150, { message: 'Ticket title can be maximum 150 characters.' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Description must be text-typed.' })
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Price must be a valid number.' })
  @IsPositive({ message: 'Price must be a number higher than 0.' })
  price?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Total-stock must be a valid number.' })
  @Min(1, { message: 'Total stock must be at least 1.' })
  totalStock?: number;

  @IsOptional()
  @IsDateString({}, { message: 'Please use (yyyy-mm-dd) date format.' })
  eventDate?: string;
}