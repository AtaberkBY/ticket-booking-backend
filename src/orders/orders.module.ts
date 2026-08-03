import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { User } from 'src/users/entities/user.entity';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Order, User, Ticket])],
    controllers: [OrdersController],
    providers: [OrdersService],
    exports: [OrdersService],
})
export class OrdersModule {}
