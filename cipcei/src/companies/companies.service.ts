import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { DataSource, In, Repository } from 'typeorm';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Room } from 'src/rooms/entities/room.entity';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Ip, IpStatus } from 'src/ips/entities/ip.entity';

@Injectable()
export class CompaniesService {
  constructor(
  @InjectRepository(Company)
  private readonly companyRepository: Repository<Company>,
  @InjectRepository(Room) 
  private readonly roomRepository: Repository<Room>,
  @InjectRepository(User)
  private readonly userRepository: Repository<User>,
  private dataSource: DataSource,
  ) {}

  async findAll(): Promise<Company[]> {
    return this.companyRepository.find();
  }

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const { user: userData, roomId } = createCompanyDto;

     // 1. Verificar se o email do usuário já existe
    const existingUser = await this.userRepository.findOneBy({ email: userData.email });
    if (existingUser) {
      throw new ConflictException(`O email "${userData.email}" já está em uso.`);
    }

    // 2. Buscar a sala para garantir que ela existe
    const room = await this.roomRepository.findOneBy({ id: roomId });
    if (!room) {
      throw new NotFoundException(`Sala com ID "${roomId}" não encontrada.`);
    }

    // 3. Criar a instância do novo usuário
    const newUser = this.userRepository.create({
      ...userData,
      role: UserRole.COMPANY,
    });

    // 4. Salvar o novo usuário no banco (o hash da senha será gerado pelo @BeforeInsert)
    const savedUser = await this.userRepository.save(newUser);

    // 5. Criar a instância da empresa e associar o usuário e a sala
    const newCompany = this.companyRepository.create({
      user: savedUser,
      room: room,
    });

    // 6. Salvar a nova empresa
    return this.companyRepository.save(newCompany);
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

  async remove(id: string): Promise<void> {
    // 1. Iniciar a transação para garantir a consistência de todas as operações
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      // 2. Encontrar a empresa e carregar suas relações ('user' e 'room')
      const company = await transactionalEntityManager.findOne(Company, { 
        where: { id },
        relations: ['user', 'room'], // Carregar a sala é crucial para a nova lógica
      });

      if (!company) {
        throw new NotFoundException(`Empresa com ID "${id}" não encontrada`);
      }

      // 3. Fazer o soft delete da empresa
      await transactionalEntityManager.softRemove(company);

      // 4. Desativar o usuário associado
      if (company.user) {
        await transactionalEntityManager.update(User, company.user.id, { isActive: false });
      }

      // 5. NOVA LÓGICA: Liberar os IPs associados à sala da empresa
      if (company.room) {
        // Encontra todos os IDs de IPs que estão 'in_use' na sala da empresa
        const ipsToRelease = await transactionalEntityManager.find(Ip, {
          select: ['id'], // Selecionamos apenas o ID para eficiência
          where: {
            room: { id: company.room.id },
            status: IpStatus.IN_USE,
          },
        });

        // Se encontrarmos algum IP para liberar...
        if (ipsToRelease.length > 0) {
          const ipIdsToRelease = ipsToRelease.map(ip => ip.id);
          
          // ... atualizamos todos eles de uma só vez
          await transactionalEntityManager.update(Ip, 
            { id: In(ipIdsToRelease) }, // Usamos o operador 'In' para atualizar múltiplos IPs
            {
              status: IpStatus.AVAILABLE,
              macAddress: undefined, // Limpa o MAC Address
            }
          );
        }
      }
      // A relação da empresa com a sala é "desvinculada" implicitamente pelo soft delete.
      // A sala agora fica livre para ser associada a uma nova empresa.
    });
  }
}