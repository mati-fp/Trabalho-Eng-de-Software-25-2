import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const user = this.userRepository.create(createUserDto);
      return await this.userRepository.save(user);
    } catch (error) {
      // PostgreSQL unique violation code: 23505
      if (error instanceof QueryFailedError) {
        const pgError = error.driverError as any;
        if (pgError?.code === '23505') {
          throw new ConflictException('Email já cadastrado no sistema');
        }
      }
      // Re-throw other errors
      throw error;
    }
  }

  async findOne(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['company'],
    });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['company'],
    });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }
}
