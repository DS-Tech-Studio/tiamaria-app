import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    const client = this.clientRepository.create(createClientDto);
    return await this.clientRepository.save(client);
  }

  async findAll(search?: string): Promise<Client[]> {
    if (!search) {
      return await this.clientRepository.find({
        order: { contact_name: 'ASC' },
      });
    }

    const term = `%${search.trim()}%`;

    return await this.clientRepository.find({
      where: [
        { contact_name: ILike(term) },
        { business_name: ILike(term) },
        { phone: ILike(term) },
        { address: ILike(term) },
      ],
      order: { contact_name: 'ASC' },
    });
  }
}