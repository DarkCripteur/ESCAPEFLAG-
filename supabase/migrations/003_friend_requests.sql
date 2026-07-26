-- Escape Flag: système d'invitations entre joueurs par pseudo (Phase 2, section 4).
-- À exécuter après 001_initial_schema.sql et 002_username_auth.sql.
--
-- Une seule table sert à la fois pour les demandes en attente et pour la liste
-- d'amis : un couple (sender_id, receiver_id) avec status='accepted' EST la relation
-- d'amitié. Pas besoin d'une table `friends` séparée.

create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint friend_requests_no_self check (sender_id <> receiver_id),
  constraint friend_requests_unique_pair unique (sender_id, receiver_id)
);

create index if not exists friend_requests_receiver_idx on public.friend_requests (receiver_id, status);
create index if not exists friend_requests_sender_idx on public.friend_requests (sender_id, status);

alter table public.friend_requests enable row level security;

create policy "Users can view requests they are part of" on public.friend_requests
  for select to authenticated
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can send requests as themselves" on public.friend_requests
  for insert to authenticated
  with check (auth.uid() = sender_id);

create policy "Receiver can respond, sender can cancel" on public.friend_requests
  for update to authenticated
  using (auth.uid() = sender_id or auth.uid() = receiver_id)
  with check (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Participants can delete their own request" on public.friend_requests
  for delete to authenticated
  using (auth.uid() = sender_id or auth.uid() = receiver_id);
