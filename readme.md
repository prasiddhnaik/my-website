## Free database options

1) Built-in backend with SQLite
   - Run: `cd backend && npm i && ADMIN_TOKEN=change-me npm run start`
   - Frontend sends analytics to `/api/events` automatically when backend is up

2) Supabase fallback (free tier)
   - Create a Supabase project, note Project URL and anon key
   - Create table `events` with columns: `event_name text`, `page_path text`, `page_title text`, `meta jsonb`, `created_at timestamp default now()`
   - Enable RLS and add policy: `insert using (true) with check (true)`
   - In `index.html`, set:
     ```js
     window.__SUPABASE = { url: 'https://YOUR-PROJECT.supabase.co', anonKey: 'YOUR_ANON_KEY' };
     ```
   - Frontend will write page views to Supabase when backend is offline


