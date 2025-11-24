import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

/**
 * UC1: Acessar aba de Orientações para Obtenção de Endereço MAC
 * Permite que empresas incubadas vejam orientações sobre como obter o MAC address
 */
@ApiTags('Help')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('help')
export class HelpController {

  @Get('mac-address')
  @Roles([UserRole.COMPANY])
  @ApiOperation({
    summary: 'Orientações para obtenção de MAC address (Company) - UC1',
    description: 'Retorna instruções detalhadas sobre como obter o endereço MAC em diferentes sistemas operacionais'
  })
  @ApiResponse({
    status: 200,
    description: 'Orientações retornadas com sucesso',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Como obter o endereço MAC' },
        description: { type: 'string' },
        windows: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            steps: { type: 'array', items: { type: 'string' } }
          }
        },
        linux: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            steps: { type: 'array', items: { type: 'string' } }
          }
        },
        mac: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            steps: { type: 'array', items: { type: 'string' } }
          }
        },
        notes: { type: 'array', items: { type: 'string' } }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão (não é Company)' })
  getMacAddressHelp() {
    return {
      title: 'Como obter o endereço MAC',
      description: 'O endereço MAC (Media Access Control) é um identificador único de 48 bits atribuído à interface de rede do seu dispositivo. Ele é composto por 6 pares de dígitos hexadecimais separados por dois pontos (:) ou hífens (-).',
      format: 'Exemplo: AA:BB:CC:DD:EE:FF ou AA-BB-CC-DD-EE-FF',
      windows: {
        title: 'Windows',
        steps: [
          '1. Pressione a tecla Windows + R para abrir o diálogo "Executar"',
          '2. Digite "cmd" e pressione Enter para abrir o Prompt de Comando',
          '3. No Prompt de Comando, digite: ipconfig /all',
          '4. Pressione Enter',
          '5. Procure pela conexão de rede que você está usando (Ethernet ou Wi-Fi)',
          '6. O endereço MAC aparece como "Endereço Físico" ou "Physical Address"',
          '7. Anote o endereço MAC no formato AA-BB-CC-DD-EE-FF'
        ]
      },
      linux: {
        title: 'Linux',
        steps: [
          '1. Abra o Terminal (geralmente Ctrl + Alt + T)',
          '2. Digite um dos seguintes comandos:',
          '   - ip link show (recomendado)',
          '   - ifconfig (em sistemas mais antigos)',
          '   - ip addr',
          '3. Pressione Enter',
          '4. Procure pela interface de rede que você está usando (geralmente eth0, enp0s3, wlan0 ou wlp2s0)',
          '5. O endereço MAC aparece após "link/ether" no formato aa:bb:cc:dd:ee:ff',
          '6. Anote o endereço MAC'
        ]
      },
      mac: {
        title: 'macOS',
        steps: [
          'Método 1 - Interface Gráfica:',
          '1. Clique no ícone da Apple no canto superior esquerdo',
          '2. Selecione "Preferências do Sistema" ou "Configurações do Sistema"',
          '3. Clique em "Rede"',
          '4. Selecione a conexão que você está usando (Wi-Fi ou Ethernet)',
          '5. Clique em "Avançado..."',
          '6. Na aba "Hardware", você verá o "Endereço MAC"',
          '',
          'Método 2 - Terminal:',
          '1. Abra o Terminal (Cmd + Espaço, digite "Terminal")',
          '2. Digite: ifconfig',
          '3. Pressione Enter',
          '4. Procure pela interface en0 (Wi-Fi) ou en1 (Ethernet)',
          '5. O endereço MAC aparece após "ether" no formato aa:bb:cc:dd:ee:ff'
        ]
      },
      notes: [
        '⚠️ O endereço MAC é único para cada interface de rede do seu dispositivo',
        '⚠️ Se você tem Wi-Fi e Ethernet, cada um terá um MAC address diferente',
        '⚠️ Certifique-se de anotar o MAC address da interface que você está usando para se conectar à rede do CEI',
        '⚠️ O formato pode variar entre sistemas: AA:BB:CC:DD:EE:FF ou AA-BB-CC-DD-EE-FF - ambos são válidos',
        'ℹ️ Você precisará deste endereço MAC ao solicitar um novo IP para sua máquina'
      ]
    };
  }
}