revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;

create index if not exists experiments_owner_id_idx on public.experiments (owner_id);

 drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists profiles_delete_own on public.profiles;
create policy profiles_delete_own
on public.profiles for delete
to authenticated
using ((select auth.uid()) = id);

drop policy if exists samples_select_own on public.samples;
create policy samples_select_own
on public.samples for select
to authenticated
using ((select auth.uid()) = owner_id);

drop policy if exists samples_insert_own on public.samples;
create policy samples_insert_own
on public.samples for insert
to authenticated
with check ((select auth.uid()) = owner_id);

drop policy if exists samples_update_own on public.samples;
create policy samples_update_own
on public.samples for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

drop policy if exists samples_delete_own on public.samples;
create policy samples_delete_own
on public.samples for delete
to authenticated
using ((select auth.uid()) = owner_id);

drop policy if exists experiments_select_own on public.experiments;
create policy experiments_select_own
on public.experiments for select
to authenticated
using ((select auth.uid()) = owner_id);

drop policy if exists experiments_insert_own on public.experiments;
create policy experiments_insert_own
on public.experiments for insert
to authenticated
with check ((select auth.uid()) = owner_id);

drop policy if exists experiments_update_own on public.experiments;
create policy experiments_update_own
on public.experiments for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

drop policy if exists experiments_delete_own on public.experiments;
create policy experiments_delete_own
on public.experiments for delete
to authenticated
using ((select auth.uid()) = owner_id);
