import { Company } from '../../companies/entities/company.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, BeforeInsert, CreateDateColumn, UpdateDateColumn, OneToOne, DeleteDateColumn, JoinColumn } from 'typeorm';
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
  name: string;

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

  @OneToOne(() => Company, { nullable: true }) // Um usuário admin não tem empresa associada
  @JoinColumn()
  company: Company;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | undefined;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
