import { Patch, Param, Body, Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AssignIpDto } from './dto/assign-ip.dto';
import { IpsService } from './ips.service';
import { FindAllIpsDto } from './dto/find-all-ips.dto';

@ApiTags('ips')
@ApiBearerAuth('JWT-auth')
@Controller('ips')
export class IpsController {
  constructor(private readonly ipsService: IpsService) {}

  @Patch(':id/assign')
  async assign(@Param('id') id: string, @Body() assignIpDto: AssignIpDto) {
    return this.ipsService.assign(id, assignIpDto);
  }

  @Get()
  async findAll(@Query() findAllIpsDto: FindAllIpsDto) {
    return this.ipsService.findAll(findAllIpsDto);
  }

  @Patch(':id/unassign')
  async unassign(@Param('id') id: string) {
    return this.ipsService.unassign(id);
  }

}