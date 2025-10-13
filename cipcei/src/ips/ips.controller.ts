import { Patch, Param, Body, Controller, Get, Query, Post } from '@nestjs/common';
import { AssignIpDto } from './dto/assign-ip.dto';
import { IpsService } from './ips.service';
import { FindAllIpsDto } from './dto/find-all-ips.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { RequestIpDto } from './dto/request-ip.dto';

@Controller('ips')
@Public()
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

  @Post('request')
  async requestIp(@Body() requestDto: RequestIpDto) {
    return this.ipsService.requestIp(
      String(requestDto.companyId),
      String(requestDto.roomId)
    );
  }

}