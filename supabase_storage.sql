-- Enable Storage
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

-- Security Policies for Media Bucket
create policy "Media Public Access"
  on storage.objects for select
  using ( bucket_id = 'media' );

create policy "Media Authenticated Upload"
  on storage.objects for insert
  with check ( bucket_id = 'media' and auth.role() = 'authenticated' );

-- Security Policies for Covers Bucket
create policy "Covers Public Access"
  on storage.objects for select
  using ( bucket_id = 'covers' );

create policy "Covers Authenticated Upload"
  on storage.objects for insert
  with check ( bucket_id = 'covers' and auth.role() = 'authenticated' );
