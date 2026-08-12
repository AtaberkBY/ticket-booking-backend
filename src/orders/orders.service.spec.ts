import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { DataSource, Repository } from 'typeorm';
import { Ticket } from '../tickets/entities/ticket.entity';
import { Order, OrderStatus } from './entities/order.entity';
import { User } from '../users/entities/user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('OrdersService', () => {
  let service: OrdersService;
  let orderRepository: Partial<Repository<Order>>;
  let ticketRepository: Partial<Repository<Ticket>>;
  let dataSource: Partial<DataSource>;

  beforeEach(async () => {
    orderRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
    };
    ticketRepository = {
      save: jest.fn(),
    };
    dataSource = {
      transaction: jest.fn(),
    };

    service = new OrdersService(
      orderRepository as unknown as Repository<Order>,
      ticketRepository as unknown as Repository<Ticket>,
      dataSource as DataSource,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates a pending order when enough stock is available', async () => {
      const ticket = {
        id: 'ticket-1',
        eventDate: new Date(Date.now() + 1000 * 60 * 60),
        totalStock: 10,
        reservedStock: 1,
        price: 20,
      } as Ticket;
      const user = { id: 'user-1' } as User;
      const manager = {
        findOne: jest.fn().mockResolvedValue(ticket),
        save: jest.fn().mockImplementation(async (entity) => entity),
        create: jest.fn().mockImplementation((cls, payload) => ({ ...payload })),
      };

      (dataSource.transaction as jest.Mock).mockImplementation(async (work) => work(manager));

      const result = await service.create({ ticketId: 'ticket-1', quantity: 2 }, user);

      expect(ticket.reservedStock).toBe(3);
      expect(manager.save).toHaveBeenCalledWith(ticket);
      expect(result.status).toBe(OrderStatus.PENDING);
      expect(result.ticketId).toBe('ticket-1');
      expect(result.userId).toBe('user-1');
    });

    it('throws when the ticket is not found', async () => {
      const manager = {
        findOne: jest.fn().mockResolvedValue(null),
        save: jest.fn(),
        create: jest.fn(),
      };
      (dataSource.transaction as jest.Mock).mockImplementation(async (work) => work(manager));

      await expect(service.create({ ticketId: 'ticket-1', quantity: 1 }, { id: 'user-1' } as User)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws when there is not enough stock', async () => {
      const ticket = {
        id: 'ticket-1',
        eventDate: new Date(Date.now() + 1000 * 60 * 60),
        totalStock: 2,
        reservedStock: 2,
        price: 20,
      } as Ticket;
      const manager = {
        findOne: jest.fn().mockResolvedValue(ticket),
        save: jest.fn(),
        create: jest.fn(),
      };
      (dataSource.transaction as jest.Mock).mockImplementation(async (work) => work(manager));

      await expect(service.create({ ticketId: 'ticket-1', quantity: 1 }, { id: 'user-1' } as User)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('confirmOrder', () => {
    it('confirms a pending order and updates ticket stock', async () => {
      const ticket = { id: 'ticket-1', reservedStock: 2, totalStock: 10 } as Ticket;
      const order = {
        id: 'order-1',
        userId: 'user-1',
        status: OrderStatus.PENDING,
        ticket,
        quantity: 2,
      } as unknown as Order;

      (orderRepository.findOne as jest.Mock).mockResolvedValue(order);
      (ticketRepository.save as jest.Mock).mockResolvedValue(ticket);
      (orderRepository.save as jest.Mock).mockImplementation(async (entity) => entity);

      const result = await service.confirmOrder('order-1', 'user-1');

      expect(result.status).toBe(OrderStatus.CONFIRMED);
      expect(ticket.reservedStock).toBe(0);
      expect(ticket.totalStock).toBe(8);
      expect(ticketRepository.save).toHaveBeenCalledWith(ticket);
      expect(orderRepository.save).toHaveBeenCalledWith(order);
    });
  });
});
