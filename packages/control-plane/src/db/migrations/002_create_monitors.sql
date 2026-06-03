CREATE table monitors(
    id uuid primary key default gen_random_uuid(),
    name varchar(255) not null,
    url text not null,
    interval integer not null default 0,
    quorum integer not null default 1,
    status varchar(20) not null default 'pending',
    last_checked_at timestamp,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
)