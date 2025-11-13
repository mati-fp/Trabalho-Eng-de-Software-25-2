# Testes do Sistema de Mensageria - UC10 e UC11

## ✅ Status: TESTES CONCLUÍDOS COM SUCESSO

### Problema Identificado e Resolvido

**Problema**: O UUID `b2c3d4e5-f678-90ab-cdef-234567890abc` usado inicialmente **não era válido** segundo o validador class-validator, mesmo existindo no banco de dados.

**Solução**: Criados novos dados de teste com UUIDs realmente válidos gerados por `gen_random_uuid()` do PostgreSQL.

---

## 📧 Credenciais Ethereal (Email de Teste)

Para visualizar os emails enviados, acesse:

**WebMail**: https://ethereal.email/login

**Credenciais**:
- User: `mjisy6d6s25os56b@ethereal.email`
- Pass: `YQdRG9RHA87S77zR5S`

---

## 🧪 Dados de Teste Válidos

### Empresa Teste
- **Company ID**: `bca81e2f-c9a8-43b7-8ad6-d2b4bf5db3dc`
- **User ID**: `379b62da-9d00-4434-81e8-4ac4eb193e60`
- **Email**: `empresa.teste@cipcei.local`
- **Nome**: `Empresa Teste Valida`

### IP Disponível
- **IP ID**: `fed459a4-af02-4d56-867f-1d39ccc42577`
- **Endereço**: `143.107.235.1/32`

---

## 🚀 Testes Manuais Realizados

### 1. UC10 - Envio de Email com IP Liberado ✅

```bash
curl -X POST http://localhost:3000/mensageria/ip-liberado \
  -H "Content-Type: application/json" \
  -d '{
    "companyId":"bca81e2f-c9a8-43b7-8ad6-d2b4bf5db3dc",
    "ipId":"fed459a4-af02-4d56-867f-1d39ccc42577"
  }'
```

**Resposta esperada**: `{"ok":true}`

**Log do servidor**:
```
[Nest] 29  - 11/13/2025, 1:28:27 AM     LOG [MensageriaService] Email enviado para empresa.teste@cipcei.local: IP liberado: 143.107.235.1/32
```

### 2. UC11 - Envio de Email de Cancelamento de IP ✅

```bash
curl -X POST http://localhost:3000/mensageria/ip-cancelado \
  -H "Content-Type: application/json" \
  -d '{
    "companyId":"bca81e2f-c9a8-43b7-8ad6-d2b4bf5db3dc",
    "ipId":"fed459a4-af02-4d56-867f-1d39ccc42577"
  }'
```

**Resposta esperada**: `{"ok":true}`

**Log do servidor**:
```
[Nest] 29  - 11/13/2025, 1:28:44 AM     LOG [MensageriaService] Email enviado para empresa.teste@cipcei.local: Cancelamento de IP: 143.107.235.1/32
```

---

## 🔗 Integração Automática com IPs

Os emails também são disparados automaticamente quando:

### UC10 - Ao aprovar/atribuir IP
```bash
# Requer autenticação JWT
PATCH /ips/:id/assign
Body: {
  "macAddress": "00:1B:44:11:3A:B7",
  "companyId": "bca81e2f-c9a8-43b7-8ad6-d2b4bf5db3dc"
}
```

### UC11 - Ao cancelar/desatribuir IP
```bash
# Requer autenticação JWT
PATCH /ips/:id/unassign
```

> **Nota**: Os endpoints de IP requerem autenticação. Use POST /auth/login para obter o token JWT.

---

## 🔍 Verificação dos Emails

1. Acesse https://ethereal.email/login
2. Faça login com as credenciais acima
3. Verifique a caixa de entrada
4. Os emails terão:
   - **Assunto**: "IP Liberado" ou "Cancelamento de IP"
   - **Destinatário**: empresa.teste@cipcei.local
   - **Conteúdo HTML** formatado com informações do IP

---

## 📊 Estrutura dos Emails

### Email de IP Liberado (UC10)
- Nome da empresa
- Endereço IP liberado
- MAC Address associado
- Sala associada
- Data/hora da liberação

### Email de Cancelamento (UC11)
- Nome da empresa
- Endereço IP cancelado
- Motivo do cancelamento
- Data/hora do cancelamento

---

## ⚙️ Configuração Atual

O arquivo `.env` está configurado com:
```env
MAIL_HOST=smtp.ethereal.email
MAIL_PORT=587
MAIL_USER=mjisy6d6s25os56b@ethereal.email
MAIL_PASS=YQdRG9RHA87S77zR5S
MAIL_FROM=CIPCEI <noreply@cipcei.ufrgs.br>
```

Para usar SMTP real (Gmail, Outlook, etc.), consulte `EMAIL_SETUP.md`.

---

## 📝 Próximos Passos

1. ✅ Endpoints manuais testados e funcionando
2. ⏭️ Testar integração automática (PATCH /ips/:id/assign e /ips/:id/unassign)
3. ⏭️ Configurar SMTP real para produção
4. ⏭️ Implementar templates de email mais elaborados (opcional)
5. ⏭️ Implementar recebimento de emails via IMAP (opcional)

---

## 🐛 Troubleshooting

### Problema: UUIDs inválidos
**Sintoma**: `{"message":["companyId must be a UUID"]}`

**Solução**: Use apenas UUIDs gerados por `gen_random_uuid()` ou bibliotecas UUID padrão. UUIDs "manuais" como `b2c3d4e5-f678-90ab-cdef-234567890abc` podem não passar na validação rigorosa do class-validator.

### Problema: Erro ECONNREFUSED
**Sintoma**: `Error: connect ECONNREFUSED 127.0.0.1:587`

**Solução**: Reinicie o container após editar o `.env`:
```bash
docker-compose restart app
```

### Problema: Email não aparece no Ethereal
**Sintoma**: API retorna sucesso mas email não aparece

**Solução**: 
1. Verifique se usou as credenciais corretas
2. Aguarde alguns segundos (pode haver delay)
3. Verifique os logs do servidor para confirmar o envio

---

**Data dos testes**: 13/11/2025  
**Testado por**: GitHub Copilot  
**Status**: ✅ Todos os testes passaram
