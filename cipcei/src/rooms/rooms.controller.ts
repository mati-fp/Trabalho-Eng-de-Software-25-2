import { Controller, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { IpsService } from 'src/ips/ips.service';
import { BulkCreateIpDto } from 'src/ips/dto/bulk-create-ip.dto';

@ApiTags('rooms')
@ApiBearerAuth('JWT-auth')
@Controller('rooms')
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