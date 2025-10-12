import { Company } from '../../companies/entities/company.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, BeforeInsert, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';

export enum UserRole {
  ADMIN = 'admin',
  COMPANY = 'company',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude() //para não expor a senha nas respostas da API
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.COMPANY,
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Company, { nullable: true }) // Um admin não pertence a uma empresa
  company: Company;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;


  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
