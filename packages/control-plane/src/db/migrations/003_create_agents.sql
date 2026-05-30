create table agents(
    id uuid primary key default gen_random_uuid(),
    name varchar(255) not null,
    location varchar(255) not null default 'localhost',
    status varchar(20) not null default 'offline',
    last_heartbeat timestamp,
    created_at timestamp not null default now()
);