# 🚀 Guia Postman - CIPCEI API

## 📦 Arquivos Criados

1. **`CIPCEI.postman_collection.json`** - Collection com todos os endpoints
2. **`CIPCEI.postman_environment.json`** - Environment com variáveis
3. **`POSTMAN_GUIDE.md`** - Este guia de uso

## 🔧 Como Importar no Postman

### 1. Importar Collection
1. Abra o Postman
2. Clique em **"Import"** (canto superior esquerdo)
3. Selecione **"Upload Files"**
4. Escolha o arquivo `CIPCEI.postman_collection.json`
5. Clique **"Import"**

### 2. Importar Environment
1. Clique no ícone de **engrenagem** (⚙️) no canto superior direito
2. Clique em **"Import"**
3. Selecione o arquivo `CIPCEI.postman_environment.json`
4. Clique **"Import"**

### 3. Selecionar Environment
1. No dropdown no canto superior direito
2. Selecione **"CIPCEI Development"**

## 📋 Estrutura da Collection

### 🔐 **Auth**
- `POST /auth/login` - Login (salva automaticamente o token)
- `POST /auth/refresh` - Renovar access token

### 👥 **Users**
- `POST /users` (Criar Admin) - Cria usuário administrador
- `POST /users` (Criar Company) - Cria usuário empresa
- `GET /users` - Lista usuários

### 🏢 **Companies**
- `GET /companies` - Lista empresas
- `POST /companies` - Cria empresa
- `GET /companies/id` - Busca empresa (⚠️ rota com bug)
- `PATCH /companies/:id` - Atualiza empresa
- `DELETE /companies/:id` - Remove empresa

### 🚪 **Rooms**
- `POST /rooms` (Sala 101) - Cria sala
- `POST /rooms` (Sala 102) - Cria outra sala
- `POST /rooms/:id/ips` - Adiciona IPs em massa

### 🌐 **IPs**
- `GET /ips` - Lista todos os IPs
- `GET /ips?status=available` - IPs disponíveis
- `GET /ips?status=in_use` - IPs em uso
- `GET /ips?roomNumber=101` - IPs por sala
- `GET /ips?companyId=...` - IPs por empresa
- `PATCH /ips/:id/assign` - Atribuir IP
- `PATCH /ips/:id/unassign` - Desatribuir IP

### 🏠 **Root**
- `GET /` - Health check (requer autenticação)

## 🎯 Fluxo de Teste Completo

### **Passo 1: Setup Inicial**
1. **Criar Admin:**
   ```
   POST /users (Criar Usuário Admin)
   ```

2. **Fazer Login:**
   ```
   POST /auth/login
   ```
   ✅ *O token será salvo automaticamente*

### **Passo 2: Criar Estrutura**
3. **Criar Salas:**
   ```
   POST /rooms (Criar Sala)  → Cria sala 101
   POST /rooms (Criar Sala 102)  → Cria sala 102
   ```
   ✅ *Os IDs das salas são salvos automaticamente*

4. **Adicionar IPs:**
   ```
   POST /rooms/:roomId/ips  → Adiciona IPs à sala
   ```

### **Passo 3: Gerenciar Empresas**
5. **Listar IPs Disponíveis:**
   ```
   GET /ips?status=available
   ```

6. **Criar Empresa:**
   ```
   POST /companies
   ```
   ⚠️ *Precisa ter room_id válido (da etapa anterior)*

### **Passo 4: Atribuir IPs**
7. **Pegar ID de um IP:**
   ```
   GET /ips?status=available
   ```
   📝 *Copie um ID e cole na variável `ip_id`*

8. **Atribuir IP:**
   ```
   PATCH /ips/:id/assign
   ```

9. **Verificar Atribuição:**
   ```
   GET /ips?status=in_use
   ```

## 🔧 Variáveis de Environment

| Variável | Descrição | Auto-preenchida? |
|----------|-----------|------------------|
| `base_url` | URL da API | ✅ |
| `access_token` | Token JWT | ✅ (no login) |
| `refresh_token` | Refresh token | ✅ (no login) |
| `user_id` | ID do usuário | ✅ (no login) |
| `company_id` | ID da empresa | ✅ (ao criar empresa) |
| `room_id` | ID da sala | ✅ (ao criar sala) |
| `ip_id` | ID do IP | ❌ (manual) |
| `assigned_ip_id` | IP atribuído | ✅ (ao atribuir) |

## 📝 Scripts Automáticos

### Login Script
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set('access_token', response.access_token);
    pm.environment.set('refresh_token', response.refresh_token);
    pm.environment.set('user_id', response.user.id);
}
```

### Sala Script
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set('room_id', response.id);
}
```

## 🚨 Pontos de Atenção

### **Bugs Conhecidos**
1. **Companies - Get by ID:** Rota é `/companies/id` (deveria ser `/companies/:id`)
2. **IPs Controller:** Ordem dos métodos alterada

### **Dependências**
- **Criar Empresa:** Precisa de `room_id` válido
- **Atribuir IP:** Precisa de `company_id` e `ip_id` válidos
- **Endpoints Protegidos:** Apenas `GET /` requer token

### **Status de Autenticação**
- 🟢 **Públicos:** Quase todos os endpoints
- 🔒 **Protegidos:** Apenas `GET /`

## 💡 Dicas de Uso

### **1. Ordem Recomendada**
```
Auth/Login → Rooms/Criar → Rooms/IPs → Companies/Criar → IPs/Atribuir
```

### **2. Filtros Úteis**
```
?status=available           # IPs livres
?status=in_use             # IPs ocupados  
?roomNumber=101            # IPs da sala 101
?companyId=uuid            # IPs da empresa
?status=available&roomNumber=101  # Combinado
```

### **3. Monitoramento**
- Console do Postman mostra logs dos scripts
- Guia **Environment** mostra valores atuais
- **Tests** mostram resultados dos scripts

## 🔄 Refresh Token

Se o access token expirar (15 minutos):
```
POST /auth/refresh  → Gera novo access token
```

## 📱 Exemplo de MAC Address

Use este formato nos testes:
```
00:1B:44:11:3A:B7
```

## 🎯 Resultado Esperado

Após seguir o fluxo:
- ✅ 1 usuário admin criado
- ✅ 2 salas criadas (101, 102)
- ✅ 5 IPs criados por sala
- ✅ 1 empresa criada
- ✅ 1 IP atribuído à empresa

---

**🚀 Pronto para testar! Siga o fluxo passo a passo para validar toda a API.**
