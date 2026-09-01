import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
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

    const existingUser = await this.userRepository.findOne({ where: { email } });
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

    delete (user as { password_hash?: string }).password_hash;
    return user;
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
    const { password, ...rest } = updateUserDto;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(password, salt);
    }

    Object.assign(user, rest);
    return this.userRepository.save(user);
  }

    async toggleStatus(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.is_active = !user.is_active;
    return this.userRepository.save(user);
    }

}