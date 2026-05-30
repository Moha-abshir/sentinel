create table probe_results(
    id uuid primary key default gen_random_uuid(),
    monitor_id uuid not null references monitors(id) on delete cascade,
    agent_id uuid not null references agents(id) on delete cascade,
    status_code integer, 
    success boolean not null, 
    response_time integer,
    checked_at timestamp default now()
);

create index idx_probe_result_monitor_checked on 
    probe_results(monitor_id, checked_at desc);