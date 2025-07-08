-- Create blogs table
create table blogs (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  content_md text not null,
  content_html text not null,
  tags text[] default '{}',
  created_at timestamp default now(),
  user_id uuid references auth.users(id) on delete cascade
);

-- Enable Row Level Security
alter table blogs enable row level security;

-- Create policies for public read access
create policy "Allow public read access" on blogs for select using (true);

-- Create policies for authenticated users to manage their own blogs
create policy "Users can insert their own blogs" on blogs for insert with check (auth.uid() = user_id);
create policy "Users can update their own blogs" on blogs for update using (auth.uid() = user_id);
create policy "Users can delete their own blogs" on blogs for delete using (auth.uid() = user_id);

-- Create index for better performance
create index blogs_slug_idx on blogs(slug);
create index blogs_created_at_idx on blogs(created_at desc);
create index blogs_tags_idx on blogs using gin(tags);
create index blogs_user_id_idx on blogs(user_id);
