import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity('tickets')
export class Ticket {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    title!: string;

    @Column('decimal')
    price!: number;

    @Column('int')
    stock!: number;
}