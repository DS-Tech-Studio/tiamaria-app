import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, name, role } = createUserDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.userRepository.create({
      email,
      name,
      role,
      password_hash: hashedPassword,
    });

    await this.userRepository.save(user);
    return this.findOne(user.id);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        is_active: true,
        created_at: true,
      },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        is_active: true,
        created_at: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        password_hash: true,
        role: true,
        is_active: true,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    const rest = updateUserDto;

    if (rest.email && rest.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: rest.email },
      });
      if (existingUser) {
        throw new ConflictException('El correo electrónico ya está registrado');
      }
    }

    Object.assign(user, rest);
    await this.userRepository.save(user);
    return this.findOne(id);
  }

  async toggleStatus(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.is_active = !user.is_active;
    await this.userRepository.save(user);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    const orderCount = await this.userRepository.manager
      .getRepository(Order)
      .count({ where: { seller_id: id } });

    if (orderCount > 0) {
      throw new ConflictException(
        'No se puede eliminar un usuario con órdenes registradas',
      );
    }

    await this.userRepository.remove(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.update(id, { last_login_at: new Date() });
  }
}
