-- Create a table for newsletter subscribers
create table if not exists newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  subscribed_at timestamptz default now(),
  locale text, -- to know which language user prefers
  is_active boolean default true
);

-- Enable RLS
alter table newsletter_subscribers enable row level security;

-- Policy: Anyone can insert (subscribe)
create policy "Anyone can subscribe"
  on newsletter_subscribers
  for insert
  with check (true);

-- Policy: Only service_role (admin) can view/select
create policy "Only admin can view subscribers"
  on newsletter_subscribers
  for select
  using (auth.role() = 'service_role');
