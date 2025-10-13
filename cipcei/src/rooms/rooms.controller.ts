import { Controller, Post, Body, Param } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { IpsService } from 'src/ips/ips.service';
import { BulkCreateIpDto } from 'src/ips/dto/bulk-create-ip.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('rooms')
@Public()
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly ipsService: IpsService
  ) {}

  @Post()
  async create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(createRoomDto);
  }

  @Post(':roomId/ips')
  async addIps(
    @Param('roomId') roomId: string,
    @Body() bulkCreateIpDto: BulkCreateIpDto,
  ) {
    return this.ipsService.bulkCreate(roomId, bulkCreateIpDto.ips);
  }
}