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
  @InjectRepository(Ip)
  private readonly ipRepository: Repository<Ip>,
  private dataSource: DataSource,
  ) {}

  async findAll() {
    const companies = await this.companyRepository.find({
      relations: ['room'],
    });

    // Retorna as empresas com roomNumber (apenas o número, sem o objeto room)
    return companies.map(({ room, ...company }) => ({
      ...company,
      roomNumber: room?.number ?? null,
    }));
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
    const savedCompany = await this.companyRepository.save(newCompany);

    // 7. Atualizar o usuário para apontar de volta para a empresa
    savedUser.company = savedCompany;
    await this.userRepository.save(savedUser);

    return savedCompany;
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
      throw new NotFoundException(`Empresa com ID "${id}" nao encontrada`);
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

      // 3. Liberar IPs ANTES do soft delete da empresa
      // IMPORTANTE: A liberação deve ocorrer antes do softRemove porque o TypeORM
      // aplica filtro global de soft-delete nas queries. Após softRemove, a relação
      // company: { id } no find() não encontraria a empresa (já "deletada"),
      // fazendo com que os IPs não fossem liberados.
      const ipsToRelease = await transactionalEntityManager.find(Ip, {
        select: ['id'],
        where: {
          company: { id: company.id }, // Filtra por empresa, não por sala
          status: IpStatus.IN_USE,
        },
      });

      if (ipsToRelease.length > 0) {
        const ipIdsToRelease = ipsToRelease.map(ip => ip.id);

        await transactionalEntityManager.update(Ip,
          { id: In(ipIdsToRelease) },
          {
            status: IpStatus.AVAILABLE,
            company: undefined as any, // Remove associação com a empresa
            macAddress: undefined,
            userName: undefined,
            assignedAt: undefined,
            expiresAt: undefined,
            isTemporary: false,
          }
        );
      }

      // 4. Fazer o soft delete da empresa (após liberar IPs)
      await transactionalEntityManager.softRemove(company);

      // 5. Desativar o usuário associado
      if (company.user) {
        await transactionalEntityManager.update(User, company.user.id, { isActive: false });
      }
      // A empresa é removida mas a sala permanece disponível para outras empresas
    });
  }

  /**
   * Company visualiza TODOS os seus IPs (ativos + expirados)
   */
  async getAllMyIps(companyId: string): Promise<Ip[]> {
    return this.ipRepository.find({
      where: { company: { id: companyId } },
      order: { assignedAt: 'DESC' },
    });
  }

  /**
   * Company visualiza apenas IPs ativos (IN_USE)
   */
  async getActiveIps(companyId: string): Promise<Ip[]> {
    return this.ipRepository.find({
      where: {
        company: { id: companyId },
        status: IpStatus.IN_USE,
      },
      order: { assignedAt: 'DESC' },
    });
  }

  /**
   * Company visualiza IPs que podem ser renovados
   * (IPs temporários expirados ou próximos de expirar - 7 dias)
   */
  async getRenewableIps(companyId: string): Promise<Ip[]> {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    return this.ipRepository
      .createQueryBuilder('ip')
      .where('ip.companyId = :companyId', { companyId })
      .andWhere('ip.isTemporary = :isTemporary', { isTemporary: true })
      .andWhere(
        '(ip.status = :expired OR (ip.expiresAt IS NOT NULL AND ip.expiresAt <= :sevenDays))',
        {
          expired: IpStatus.EXPIRED,
          sevenDays: sevenDaysFromNow,
        },
      )
      .orderBy('ip.expiresAt', 'ASC')
      .getMany();
  }
}