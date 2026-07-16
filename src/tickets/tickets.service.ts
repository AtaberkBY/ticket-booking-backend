import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
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
}