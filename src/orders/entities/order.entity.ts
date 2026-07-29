import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn} from 'typeorm'
import { User } from '../../users/entities/user.entity'
import { Ticket } from '../../tickets/entities/ticket.entity'

export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
}

@Entity('orders')
export class Order{
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'int'})
    quantity!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2})
    totalPrice!: number;

    @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING})
    status!: OrderStatus;

    @ManyToOne(() => User, { onDelete: 'CASCADE'})
    @JoinColumn({ name:'userId'})
    user!: User;

    @Column()
    userId!: string;

    @ManyToOne(() => Ticket, { onDelete: 'RESTRICT'})
    @JoinColumn({ name:'ticketId'})
    ticket!: Ticket

    @Column()
    ticketId!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}