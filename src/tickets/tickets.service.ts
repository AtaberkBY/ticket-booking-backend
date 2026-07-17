import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, MoreThan, FindManyOptions } from "typeorm";
import { Ticket } from "./entities/ticket.entity";
import { CreateTicketDto } from "./dto/create-ticket.dto";

@Injectable()
export class TicketsService {
    constructor(
        @InjectRepository(Ticket)
        private readonly ticketRepository: Repository<Ticket>
    ) {}


    async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
        const eventDate = new Date(createTicketDto.eventDate);

        if(eventDate < new Date()){
            throw new BadRequestException('Selected date is invalid. The date cannot be in the past.')
        }

        const newTicket = this.ticketRepository.create({
            ...createTicketDto,
            eventDate,
        });
        return this.ticketRepository.save(newTicket);
    }

    async findAll(onlyAvailable: boolean = false): Promise<Ticket[]> {
        const findOptions: FindManyOptions<Ticket> = {
            order: { eventDate: 'ASC'},
        };
        if(onlyAvailable) {
            findOptions.where = {
                totalStock: MoreThan(0),
                eventDate: MoreThan(new Date()),
            };
        }

        return this.ticketRepository.find(findOptions);
    }

    async findOne(id: string): Promise<Ticket> {
        const ticket = await this.ticketRepository.findOne({ where: { id } });
        if(!ticket){
            throw new NotFoundException(`There is no ticket with the id:${id}`);
        }

        return ticket;
    }
}