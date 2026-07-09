import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { User } from 'src/users/entities/user.entity';
import { Ticket } from 'src/tickets/entities/ticket.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Order, User, Ticket])]
})
export class OrdersModule {}
