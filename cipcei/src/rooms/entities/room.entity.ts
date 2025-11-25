import { Ip } from 'src/ips/entities/ip.entity';
import { Company } from '../../companies/entities/company.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', unique: true })
  number: number;

  @OneToMany(() => Company, (company) => company.room)
  companies: Company[];

  @OneToMany(() => Ip, (ip) => ip.room)
  ips: Ip[];
}