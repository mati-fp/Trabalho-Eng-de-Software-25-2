import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { Repository } from 'typeorm';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Room } from 'src/rooms/entities/room.entity';

@Injectable()
export class CompaniesService {
  constructor(
  @InjectRepository(Company)
  private readonly companyRepository: Repository<Company>,
  @InjectRepository(Room) 
  private readonly roomRepository: Repository<Room>,
  ) {}

  async findAll(): Promise<Company[]> {
    return this.companyRepository.find();
  }

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const { name, email, roomId } = createCompanyDto;

    // 1. Busca a sala pelo ID fornecido
    const room = await this.roomRepository.findOneBy({ id: roomId });
    if (!room) {
      throw new NotFoundException(`Room with ID "${roomId}" not found`);
    }

    // 2. Cria a nova empresa e associa a sala encontrada
    const company = this.companyRepository.create({
      name,
      email,
      room: room,
    });

    // 3. Salva a empresa
    return this.companyRepository.save(company);
  }

  async findOne(id: string): Promise<Company | null> {
    return this.companyRepository.findOneBy({ id });
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto): Promise<Company> {
    // O método `preload` busca uma entidade pelo id e a atualiza com os novos dados.
    const company = await this.companyRepository.preload({
      id: id,
      ...updateCompanyDto,
    });
    if (!company) {
      throw new NotFoundException(`Company with ID "${id}" not found`);
    }
    return this.companyRepository.save(company);
  }

  async remove(id: string) {
    const company = await this.findOne(id); // Reutiliza o método findOne para checar se a empresa existe
    if (!company) {
      throw new NotFoundException(`Company with ID "${id}" not found`);
    }
    return this.companyRepository.remove(company);
  }
}