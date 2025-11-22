-- Rodar da seguinte maneira após subir os containers pela primeira vez para popular com algumas salas e ips.
-- 
-- Windows PowerShell:
-- Get-Content seed.sql | docker exec -i postgres-cipcei psql -U user -d cipcei_db
--
-- Linux/Mac:
-- PGPASSWORD=password docker exec -i postgres-cipcei psql -U user -d cipcei_db < seed.sql

-- Inicia um bloco de transação para garantir que tudo seja executado de uma vez ou nada seja.
DO $$
DECLARE
    -- Variáveis para armazenar os IDs gerados
    v_admin_user_id uuid;
    v_company1_user_id uuid;
    v_company2_user_id uuid;
    v_company1_id uuid;
    v_company2_id uuid;
    v_room1_id uuid;
    v_room2_id uuid;
    v_room3_id uuid;
    v_room4_id uuid;
    v_room5_id uuid;
    v_ips_to_assign uuid[];
    -- Senha 'password123' hasheada com bcrypt. Use o hash real gerado pela sua aplicação.
    -- Este é um exemplo: $2b$10$Kie4.iR.f23a.PTg5VpLzO0U/sJk.e1m.e.e.e.e.e.e.e
    v_hashed_password TEXT := '$2b$10$Kie4.iR.f23a.PTg5VpLzO0U/sJk.e1m.e.e.e.e.e.e.e';
BEGIN
    RAISE NOTICE 'Iniciando a inserção de dados de teste...';

    -- 1. CRIAR USUÁRIOS
    RAISE NOTICE 'Criando usuários (1 admin, 2 de empresa)...';
    INSERT INTO "user" (name, email, password, role, "isActive") VALUES
    ('Admin CEI', 'admin@cei.ufrgs.br', v_hashed_password, 'admin', true)
    ON CONFLICT (email) DO NOTHING RETURNING id INTO v_admin_user_id;

    INSERT INTO "user" (name, email, password, role, "isActive") VALUES
    ('Empresa Inovadora', 'contato@empresa-inovadora.com', v_hashed_password, 'company', true)
    ON CONFLICT (email) DO NOTHING RETURNING id INTO v_company1_user_id;

    INSERT INTO "user" (name, email, password, role, "isActive") VALUES
    ('Tech Solutions', 'suporte@techsolutions.com', v_hashed_password, 'company', true)
    ON CONFLICT (email) DO NOTHING RETURNING id INTO v_company2_user_id;

    -- 2. CRIAR SALAS
    RAISE NOTICE 'Criando 5 salas...';
    INSERT INTO room (number) VALUES (101) ON CONFLICT (number) DO NOTHING RETURNING id INTO v_room1_id;
    INSERT INTO room (number) VALUES (102) ON CONFLICT (number) DO NOTHING RETURNING id INTO v_room2_id;
    INSERT INTO room (number) VALUES (103) ON CONFLICT (number) DO NOTHING RETURNING id INTO v_room3_id;
    INSERT INTO room (number) VALUES (104) ON CONFLICT (number) DO NOTHING RETURNING id INTO v_room4_id;
    INSERT INTO room (number) VALUES (105) ON CONFLICT (number) DO NOTHING RETURNING id INTO v_room5_id;

    -- Se os usuários já existiam, precisamos buscar seus IDs para os próximos passos
    IF v_company1_user_id IS NULL THEN
        SELECT id INTO v_company1_user_id FROM "user" WHERE email = 'contato@empresa-inovadora.com';
    END IF;
    IF v_company2_user_id IS NULL THEN
        SELECT id INTO v_company2_user_id FROM "user" WHERE email = 'suporte@techsolutions.com';
    END IF;
    -- Se as salas já existiam, precisamos buscar seus IDs
    IF v_room1_id IS NULL THEN SELECT id INTO v_room1_id FROM room WHERE number = 101; END IF;
    IF v_room2_id IS NULL THEN SELECT id INTO v_room2_id FROM room WHERE number = 102; END IF;
    IF v_room3_id IS NULL THEN SELECT id INTO v_room3_id FROM room WHERE number = 103; END IF;
    IF v_room4_id IS NULL THEN SELECT id INTO v_room4_id FROM room WHERE number = 104; END IF;
    IF v_room5_id IS NULL THEN SELECT id INTO v_room5_id FROM room WHERE number = 105; END IF;

    -- 3. CRIAR EMPRESAS E ASSOCIAR A USUÁRIOS E SALAS
    RAISE NOTICE 'Criando empresas e associando a usuários e salas...';
    INSERT INTO company ("userId", "roomId") VALUES (v_company1_user_id, v_room1_id) ON CONFLICT ("userId") DO NOTHING RETURNING id INTO v_company1_id;
    INSERT INTO company ("userId", "roomId") VALUES (v_company2_user_id, v_room2_id) ON CONFLICT ("userId") DO NOTHING RETURNING id INTO v_company2_id;

    -- 4. FAZER CARGA DE 10 IPs PARA CADA SALA
    RAISE NOTICE 'Fazendo carga de 10 IPs para cada sala...';
    INSERT INTO ip (address, "roomId") SELECT '192.168.1.' || s.i, v_room1_id FROM generate_series(1, 10) AS s(i) ON CONFLICT (address) DO NOTHING;
    INSERT INTO ip (address, "roomId") SELECT '192.168.2.' || s.i, v_room2_id FROM generate_series(1, 10) AS s(i) ON CONFLICT (address) DO NOTHING;
    INSERT INTO ip (address, "roomId") SELECT '192.168.3.' || s.i, v_room3_id FROM generate_series(1, 10) AS s(i) ON CONFLICT (address) DO NOTHING;
    INSERT INTO ip (address, "roomId") SELECT '192.168.4.' || s.i, v_room4_id FROM generate_series(1, 10) AS s(i) ON CONFLICT (address) DO NOTHING;
    INSERT INTO ip (address, "roomId") SELECT '192.168.5.' || s.i, v_room5_id FROM generate_series(1, 10) AS s(i) ON CONFLICT (address) DO NOTHING;

    -- 5. ATRIBUIR 4 IPs PARA CADA EMPRESA
    RAISE NOTICE 'Atribuindo 4 IPs para a Empresa 1 (Sala 101)...';
    SELECT array_agg(id) INTO v_ips_to_assign FROM (
        SELECT id FROM ip WHERE "roomId" = v_room1_id AND status = 'available' LIMIT 4
    ) AS subquery;
    UPDATE ip SET status = 'in_use', "macAddress" = '00:1A:2B:3C:4D:01' WHERE id = ANY(v_ips_to_assign);

    RAISE NOTICE 'Atribuindo 4 IPs para a Empresa 2 (Sala 102)...';
    SELECT array_agg(id) INTO v_ips_to_assign FROM (
        SELECT id FROM ip WHERE "roomId" = v_room2_id AND status = 'available' LIMIT 4
    ) AS subquery;
    UPDATE ip SET status = 'in_use', "macAddress" = '00:1A:2B:3C:4D:02' WHERE id = ANY(v_ips_to_assign);

    RAISE NOTICE 'Inserção de dados de teste concluída.';
END $$;