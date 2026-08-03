import {Controller, Post, Get, Patch, Body, Param, UseGuards, Request} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}


    @Post()
    async create(@Body() createOrderDto: CreateOrderDto, @Request() req: any) {
        return this.ordersService.create(createOrderDto, req.user);
    }

    @Get('me')
    async findMyOrders(@Request() req: any) {
        return this.ordersService.findMyOrders(req.user.id);
    }

    @Patch(':id/confirm')
    async confirmOrder(@Param('id') id:string, @Request() req:any) {
        return this.ordersService.confirmOrder(id, req.user.id);
    }

    @Patch(':id/cancel')
    async cancelOrder(@Param('id') id:string, @Request() req:any) {
        return this.ordersService.cancelOrder(id, req.user.id);
    }
}