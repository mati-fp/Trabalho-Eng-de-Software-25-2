import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Ip } from '../../ips/entities/ip.entity';
import { Company } from '../../companies/entities/company.entity';
import { User } from '../../users/entities/user.entity';

export enum IpAction {
  ASSIGNED = 'assigned',
  RELEASED = 'released',
  RENEWED = 'renewed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  REQUESTED = 'requested',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('ip_history')
export class IpHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Ip, { eager: true })
  ip: Ip;

  @ManyToOne(() => Company, { nullable: true, eager: true })
  company: Company;

  @Column({
    type: 'enum',
    enum: IpAction,
  })
  action: IpAction;

  @ManyToOne(() => User, { eager: true })
  performedBy: User;

  @CreateDateColumn()
  performedAt: Date;

  @Column({ nullable: true })
  macAddress: string;

  @Column({ nullable: true })
  userName: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  expirationDate: Date;
}