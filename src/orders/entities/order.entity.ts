import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn} from 'typeorm'
import { User } from '../../users/entities/user.entity'
import { Ticket } from '../../tickets/entities/ticket.entity'

@Entity('orders')
export class Order{
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User)
    user!: User;

    @ManyToOne(() => Ticket)
    ticket!: Ticket

    @CreateDateColumn()
    createdAt!: Date;

}