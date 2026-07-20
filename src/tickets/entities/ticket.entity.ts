import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('tickets')
export class Ticket {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 150 })
    title!: string;

    @Column({ type:'text', nullable:true})
    description?: string;

    @Column({ type:'decimal', precision: 10, scale: 2})
    price!: number;

    @Column({ type:'int'})
    totalStock!: number;

    @Column({ type:'int', default:0})
    reservedStock!: number;

    @Column({ type:'timestamp'})
    eventDate!: Date;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}