-- Rodar da seguinte maneira após subir os containers pela primeira vez para popular com algumas salas e ips.
-- PGPASSWORD=password docker exec -i cipcei-postgres-db psql -U user -d cipcei_db < seed.sql

-- Inicia um bloco de transação para garantir que tudo seja executado de uma vez.
DO $$
DECLARE
    v_room_id uuid;
BEGIN
    RAISE NOTICE 'Iniciando a inserção de salas e IPs...';

    -- Sala 101 (143.107.235.1 - 143.107.235.62)
    RAISE NOTICE 'Processando Sala 101...';
    INSERT INTO "room" (number) VALUES (101) ON CONFLICT (number) DO UPDATE SET number = EXCLUDED.number RETURNING id INTO v_room_id;
    INSERT INTO "ip" (address, "roomId")
    SELECT
        ('143.107.235.1'::inet + s.i)::text,
        v_room_id
    FROM
        generate_series(0, '143.107.235.62'::inet - '143.107.235.1'::inet) AS s(i)
    ON CONFLICT (address) DO NOTHING;

    -- Sala 102 (143.107.235.65 - 143.107.235.126)
    RAISE NOTICE 'Processando Sala 102...';
    INSERT INTO "room" (number) VALUES (102) ON CONFLICT (number) DO UPDATE SET number = EXCLUDED.number RETURNING id INTO v_room_id;
    INSERT INTO "ip" (address, "roomId")
    SELECT
        ('143.107.235.65'::inet + s.i)::text,
        v_room_id
    FROM
        generate_series(0, '143.107.235.126'::inet - '143.107.235.65'::inet) AS s(i)
    ON CONFLICT (address) DO NOTHING;

    -- Sala 103 (143.107.235.129 - 143.107.235.190)
    RAISE NOTICE 'Processando Sala 103...';
    INSERT INTO "room" (number) VALUES (103) ON CONFLICT (number) DO UPDATE SET number = EXCLUDED.number RETURNING id INTO v_room_id;
    INSERT INTO "ip" (address, "roomId")
    SELECT
        ('143.107.235.129'::inet + s.i)::text,
        v_room_id
    FROM
        generate_series(0, '143.107.235.190'::inet - '143.107.235.129'::inet) AS s(i)
    ON CONFLICT (address) DO NOTHING;

    -- Sala 104 (143.107.235.193 - 143.107.235.254)
    RAISE NOTICE 'Processando Sala 104...';
    INSERT INTO "room" (number) VALUES (104) ON CONFLICT (number) DO UPDATE SET number = EXCLUDED.number RETURNING id INTO v_room_id;
    INSERT INTO "ip" (address, "roomId")
    SELECT
        ('143.107.235.193'::inet + s.i)::text,
        v_room_id
    FROM
        generate_series(0, '143.107.235.254'::inet - '143.107.235.193'::inet) AS s(i)
    ON CONFLICT (address) DO NOTHING;

    -- Sala 201 (143.107.233.1 - 143.107.233.62)
    RAISE NOTICE 'Processando Sala 201...';
    INSERT INTO "room" (number) VALUES (201) ON CONFLICT (number) DO UPDATE SET number = EXCLUDED.number RETURNING id INTO v_room_id;
    INSERT INTO "ip" (address, "roomId")
    SELECT
        ('143.107.233.1'::inet + s.i)::text,
        v_room_id
    FROM
        generate_series(0, '143.107.233.62'::inet - '143.107.233.1'::inet) AS s(i)
    ON CONFLICT (address) DO NOTHING;

    -- Sala 202 (143.107.233.65 - 143.107.233.126)
    RAISE NOTICE 'Processando Sala 202...';
    INSERT INTO "room" (number) VALUES (202) ON CONFLICT (number) DO UPDATE SET number = EXCLUDED.number RETURNING id INTO v_room_id;
    INSERT INTO "ip" (address, "roomId")
    SELECT
        ('143.107.233.65'::inet + s.i)::text,
        v_room_id
    FROM
        generate_series(0, '143.107.233.126'::inet - '143.107.233.65'::inet) AS s(i)
    ON CONFLICT (address) DO NOTHING;

    -- Sala 203 (143.107.233.129 - 143.107.233.190)
    RAISE NOTICE 'Processando Sala 203...';
    INSERT INTO "room" (number) VALUES (203) ON CONFLICT (number) DO UPDATE SET number = EXCLUDED.number RETURNING id INTO v_room_id;
    INSERT INTO "ip" (address, "roomId")
    SELECT
        ('143.107.233.129'::inet + s.i)::text,
        v_room_id
    FROM
        generate_series(0, '143.107.233.190'::inet - '143.107.233.129'::inet) AS s(i)
    ON CONFLICT (address) DO NOTHING;

    -- Sala 204 (143.107.233.193 - 143.107.233.254)
    RAISE NOTICE 'Processando Sala 204...';
    INSERT INTO "room" (number) VALUES (204) ON CONFLICT (number) DO UPDATE SET number = EXCLUDED.number RETURNING id INTO v_room_id;
    INSERT INTO "ip" (address, "roomId")
    SELECT
        ('143.107.233.193'::inet + s.i)::text,
        v_room_id
    FROM
        generate_series(0, '143.107.233.254'::inet - '143.107.233.193'::inet) AS s(i)
    ON CONFLICT (address) DO NOTHING;

    RAISE NOTICE 'Inserção concluída.';
END $$;