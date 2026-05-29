-- Bell inbox: Supabase Realtime for new rows (post_comment, follow, reaction, etc.)

do $$
begin
  alter publication supabase_realtime add table public.community_notifications;
exception
  when duplicate_object then
    null;
end $$;
