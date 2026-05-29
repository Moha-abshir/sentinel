CREATE table if not exists agents (
    id serial primary key,
    host_name varchar(255) not null,
    status varchar(255) default 'offline',
    last_seen timestamp
);