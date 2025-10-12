import { Company } from '../../companies/entities/company.entity';
import { Room } from '../../rooms/entities/room.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

export enum IpStatus {
  AVAILABLE = 'available',
  IN_USE = 'in_use',
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

  @ManyToOne(() => Room, (room) => room.ips)
  room: Room;
}