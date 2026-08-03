import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { Ticket } from '../tickets/entities/ticket.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(Ticket)
        private readonly ticketRepository: Repository<Ticket>,
        private readonly dataSource: DataSource,
    ) {}

    async create(createOrderDto: CreateOrderDto, user: User): Promise<Order> {
        const { ticketId, quantity } = createOrderDto;

        return this.dataSource.transaction(async (manager) => {
            const ticket = await manager.findOne(Ticket, {
                where: { id: ticketId },
                lock: { mode: 'pessimistic_write' },
            });

        if(!ticket){
            throw new NotFoundException(`Ticket with ID ${ticketId} not found.`);
        }

        if(new Date(ticket.eventDate) < new Date()) {
            throw new BadRequestException(`Cannot create order for past event.`);
        }

        if(ticket.totalStock - ticket.reservedStock < quantity) {
            throw new BadRequestException(`Not enough stock available for ticket ${ticketId}.`);
        }

        ticket.reservedStock += quantity;
        await manager.save(ticket);

        const totalPrice = Number(ticket.price) * quantity;
        const order = manager.create(Order,{
            user,
            userId: user.id,
            ticket,
            ticketId: ticket.id,
            quantity,
            totalPrice,
            status: OrderStatus.PENDING,
        });
        return manager.save(order);

    });

    }

    async confirmOrder(orderId: string, userId: string): Promise<Order> {
        const order = await this.orderRepository.findOne({ 
            where: { id: orderId}, 
            relations: {
                ticket: true,
            },
        });

        if(!order){
            throw new NotFoundException(`Order with ID ${orderId} not found.`);
        }

        if(order.userId !== userId){
            throw new BadRequestException(`You are not authorized to confirm this order.`);
        }

        if(order.status !== OrderStatus.PENDING){
            throw new BadRequestException(`Only pending orders can be confirmed.`);
        }

        const ticket = order.ticket;

        ticket.reservedStock -= order.quantity;
        ticket.totalStock -= order.quantity;
        await this.ticketRepository.save(ticket);

        order.status = OrderStatus.CONFIRMED;
        return this.orderRepository.save(order);
    }

    async cancelOrder(orderId: string, userId: string): Promise<Order> {
        const order = await this.orderRepository.findOne({
            where: {id: orderId},
            relations: {
                ticket: true,
            },
        });

        if(!order){
            throw new NotFoundException(`Order with ID ${orderId} not found.`);
        }

        if(order.userId !== userId){
            throw new BadRequestException(`You are not authorized to cancel this order.`);
        }

        if(order.status !== OrderStatus.PENDING){
            throw new BadRequestException(`Only pending orders can be canceled.`);
        }

        const ticket = order.ticket;
        ticket.reservedStock -= order.quantity;
        await this.ticketRepository.save(ticket);

        order.status = OrderStatus.CANCELLED;
        return this.orderRepository.save(order);
    }

    async findMyOrders(userId: string): Promise<Order[]> {
        return this.orderRepository.find({
            where: {userId},
            relations: {
                ticket: true,
            },
            order: { createdAt: 'DESC'},
        });
    }
}
