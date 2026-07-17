import { Controller, Post, Body, Get, Param, Query, UseGuards } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';


@Controller('tickets')
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) {}


    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    async create(@Body() createTicketDto: CreateTicketDto) {
        return this.ticketsService.create(createTicketDto);
    }

    @Get()
    async findAll(@Query('available') available?: string) {
        const onlyAvailable = available === 'true';
        return this.ticketsService.findAll(onlyAvailable);
    }

    @Get(':id')
    async findOne(@Param('id') id:string) {
        return this.ticketsService.findOne(id);
    }
}