import { Company } from '../../companies/entities/company.entity';
import { Room } from '../../rooms/entities/room.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum IpStatus {
  AVAILABLE = 'available',
  IN_USE = 'in_use',
  EXPIRED = 'expired',
}

@Entity()
export class Ip {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  address: string;

  @Column({
    type: 'enum',
    enum: IpStatus,
    default: IpStatus.AVAILABLE,
  })
  status: IpStatus;

  @Column({ nullable: true })
  macAddress: string;

  @Column({ nullable: true })
  userName: string;

  @Column({ default: false })
  isTemporary: boolean;

  @Column({ nullable: true })
  assignedAt: Date;

  @Column({ nullable: true })
  expiresAt: Date;

  @Column({ nullable: true })
  lastRenewedAt: Date;

  @ManyToOne(() => Room, (room) => room.ips)
  room: Room;

  @ManyToOne(() => Company, { nullable: true, eager: true })
  company: Company;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}