import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnApplicationBootstrap {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService,
    ) {}

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: {email} });
    }

    async create(userData: Partial<User>): Promise<User> {
        const newUser = this.userRepository.create(userData);
        return this.userRepository.save(newUser);
    }

    async updateRefreshToken ( userId: string, token: string | null): Promise<void> {
        await this.userRepository.update(userId, { refreshToken: token || undefined});
    }

    async findById(id: string): Promise <User | null> {
        return this.userRepository.findOne({where: {id}});
    }

    async onApplicationBootstrap() {
        await this.seedAdminUser();
    }

    private async seedAdminUser(){
        const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
        const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

        if(!adminEmail || !adminPassword){
            console.warn('Seed Warning: ADMIN_EMAIL or ADMIN_PASSWORD is missing from the .env file. Skipping admin seeding.');
            return;
        }

        const existingAdmin = await this.userRepository.findOne({ where: { email: adminEmail} });
        if(existingAdmin) {
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        const admin = this.userRepository.create({
            email: adminEmail,
            password: hashedPassword,
            role: 'admin',
        });

        await this.userRepository.save(admin);
        console.log(`[SEED] Success: Admin user with email ${adminEmail} has been created.`)
    }

}