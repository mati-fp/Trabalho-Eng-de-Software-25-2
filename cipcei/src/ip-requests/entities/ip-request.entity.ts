import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { Ip } from '../../ips/entities/ip.entity';
import { User } from '../../users/entities/user.entity';

export enum IpRequestType {
  NEW = 'new',
  RENEWAL = 'renewal',
  CANCELLATION = 'cancellation',
}

export enum IpRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

@Entity('ip_requests')
export class IpRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Company, { eager: true })
  company: Company;

  @ManyToOne(() => Ip, { nullable: true, eager: true })
  ip: Ip;

  @Column({
    type: 'enum',
    enum: IpRequestType,
  })
  requestType: IpRequestType;

  @Column({
    type: 'enum',
    enum: IpRequestStatus,
    default: IpRequestStatus.PENDING,
  })
  status: IpRequestStatus;

  @ManyToOne(() => User, { eager: true })
  requestedBy: User;

  @ManyToOne(() => User, { nullable: true, eager: true })
  approvedBy: User;

  @CreateDateColumn()
  requestDate: Date;

  @Column({ nullable: true })
  responseDate: Date;

  @Column({ nullable: true })
  expirationDate: Date;

  @Column({ type: 'text' })
  justification: string;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ nullable: true })
  macAddress: string;

  @Column({ nullable: true })
  userName: string;

  @Column({ default: false })
  isTemporary: boolean;

  @UpdateDateColumn()
  updatedAt: Date;
}