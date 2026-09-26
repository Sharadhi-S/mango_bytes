-- ShramaSetu Production Schema Migration
-- Enables real-time synchronization between Employer, Contractor, and Worker

create extension if not exists "uuid-ossp";

-- 1. Profiles (Unified identity linking auth.users)
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  phone text,
  role text not null check (role in ('labourer', 'skilled_worker', 'contractor', 'employer', 'admin')),
  avatar_url text,
  language text default 'en',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Employers (Client / Project Owner)
create table if not exists public.employers (
  id uuid primary key references public.profiles(id) on delete cascade,
  company_name text not null,
  gst_number text,
  industry text,
  location text,
  verified boolean default true,
  created_at timestamptz default now()
);

-- 3. Contractors (Workforce Operator)
create table if not exists public.contractors (
  id uuid primary key references public.profiles(id) on delete cascade,
  company_name text not null,
  license_number text,
  location text not null,
  experience_years int default 0,
  rating numeric(3,2) default 4.5,
  active_projects_count int default 0,
  verified boolean default true,
  created_at timestamptz default now()
);

-- 4. Workers (Labourers & Skilled Craftsmen)
create table if not exists public.workers (
  id uuid primary key references public.profiles(id) on delete cascade,
  primary_skill text not null,
  skills text[] default array[]::text[],
  experience_years int default 0,
  location text not null,
  daily_wage numeric(10,2) default 0,
  rating numeric(3,2) default 4.5,
  is_available boolean default true,
  bank_details jsonb,
  created_at timestamptz default now()
);

-- 5. Projects (Tenders & Work Orders)
create table if not exists public.projects (
  id uuid primary key default uuid_generate_v4(),
  employer_id uuid not null references public.employers(id) on delete cascade,
  selected_contractor_id uuid references public.contractors(id),
  title text not null,
  tender_number text,
  description text,
  location text not null,
  budget numeric(14,2) not null,
  dynamic_fee numeric(10,2) default 0,
  start_date date,
  duration_months int default 1,
  status text not null default 'draft' check (status in (
    'draft', 'analyzed', 'open_for_contractors', 'rfp_sent',
    'contractor_selected', 'workforce_planning', 'active', 'completed', 'cancelled'
  )),
  tender_document_url text,
  raw_tender_text text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. Project Requirements (Headcount & skill demand)
create table if not exists public.project_requirements (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  skill text not null,
  headcount_needed int not null,
  headcount_assigned int default 0,
  daily_wage numeric(10,2) not null,
  certifications_required text[] default array[]::text[],
  created_at timestamptz default now()
);

-- 7. Project Milestones
create table if not exists public.project_milestones (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  due_date date,
  target_date date,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'delayed')),
  completion_pct int default 0,
  created_at timestamptz default now()
);

-- 8. Contractor RFPs (Request for Proposal & Selection)
create table if not exists public.contractor_rfps (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  employer_id uuid not null references public.employers(id),
  contractor_id uuid not null references public.contractors(id),
  status text not null default 'sent' check (status in ('sent', 'viewed', 'accepted', 'declined', 'withdrawn')),
  message text,
  response_notes text,
  response_date timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 9. Worker Project Invitations
create table if not exists public.worker_project_invitations (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  contractor_id uuid not null references public.contractors(id),
  worker_id uuid not null references public.workers(id),
  skill text not null,
  daily_wage numeric(10,2) not null,
  status text not null default 'invited' check (status in ('invited', 'accepted', 'declined', 'expired')),
  invited_at timestamptz default now(),
  responded_at timestamptz,
  notes text
);

-- 10. Worker Project Assignments
create table if not exists public.worker_project_assignments (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  contractor_id uuid not null references public.contractors(id),
  worker_id uuid not null references public.workers(id),
  skill text not null,
  daily_wage numeric(10,2) not null,
  expected_days int default 30,
  expected_earnings numeric(12,2) default 0,
  status text not null default 'assigned' check (status in ('assigned', 'active', 'completed', 'cancelled')),
  assigned_at timestamptz default now(),
  created_at timestamptz default now(),
  unique(project_id, worker_id)
);

-- 11. Attendance (Daily Muster Roll)
create table if not exists public.attendance (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  contractor_id uuid not null references public.contractors(id),
  worker_id uuid not null references public.workers(id),
  date date not null default current_date,
  status text not null check (status in ('present', 'half', 'absent')),
  hours_worked numeric(4,2) default 8.0,
  wage_earned numeric(10,2) default 0,
  notes text,
  marked_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(project_id, worker_id, date)
);

-- 12. Wage Records (Contractor Wage Ledger)
create table if not exists public.wage_records (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  contractor_id uuid not null references public.contractors(id),
  worker_id uuid not null references public.workers(id),
  period_start date not null,
  period_end date not null,
  days_present numeric(4,1) default 0,
  total_amount numeric(10,2) not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  disbursed_date timestamptz,
  payment_reference text,
  transaction_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 13. Earnings (Worker Individual Earnings)
create table if not exists public.earnings (
  id uuid primary key default uuid_generate_v4(),
  worker_id uuid not null references public.workers(id) on delete cascade,
  date date not null default current_date,
  amount numeric(10,2) not null,
  project_id uuid references public.projects(id),
  attendance_id uuid references public.attendance(id),
  wage_record_id uuid references public.wage_records(id),
  status text not null default 'accrued' check (status in ('accrued', 'paid')),
  created_at timestamptz default now()
);

-- 14. Conversations
create table if not exists public.conversations (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id),
  title text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 15. Conversation Participants
create table if not exists public.conversation_participants (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null,
  joined_at timestamptz default now(),
  unique(conversation_id, profile_id)
);

-- 16. Messages (Real-time Cross-Role Chat)
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  receiver_id uuid references public.profiles(id),
  text text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- 17. Notifications
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null,
  related_entity_type text,
  related_entity_id uuid,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- 18. Savings Goals
create table if not exists public.savings_goals (
  id uuid primary key default uuid_generate_v4(),
  worker_id uuid not null references public.workers(id) on delete cascade,
  title text not null,
  target_amount numeric(10,2) not null,
  current_amount numeric(10,2) default 0,
  target_date date not null,
  status text not null default 'active' check (status in ('active', 'completed', 'paused', 'cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 19. Savings Contributions
create table if not exists public.savings_contributions (
  id uuid primary key default uuid_generate_v4(),
  goal_id uuid not null references public.savings_goals(id) on delete cascade,
  worker_id uuid not null references public.workers(id) on delete cascade,
  amount numeric(10,2) not null,
  date date not null default current_date,
  note text,
  created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_projects_employer on public.projects(employer_id);
create index if not exists idx_projects_contractor on public.projects(selected_contractor_id);
create index if not exists idx_rfps_contractor on public.contractor_rfps(contractor_id);
create index if not exists idx_rfps_project on public.contractor_rfps(project_id);
create index if not exists idx_invitations_worker on public.worker_project_invitations(worker_id);
create index if not exists idx_assignments_project on public.worker_project_assignments(project_id);
create index if not exists idx_assignments_worker on public.worker_project_assignments(worker_id);
create index if not exists idx_attendance_project_date on public.attendance(project_id, date);
create index if not exists idx_attendance_worker on public.attendance(worker_id);
create index if not exists idx_wage_records_contractor on public.wage_records(contractor_id);
create index if not exists idx_wage_records_worker on public.wage_records(worker_id);
create index if not exists idx_messages_conversation on public.messages(conversation_id);
create index if not exists idx_messages_sender on public.messages(sender_id);
create index if not exists idx_notifications_recipient on public.notifications(recipient_id);
create index if not exists idx_savings_goals_worker on public.savings_goals(worker_id);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.employers enable row level security;
alter table public.contractors enable row level security;
alter table public.workers enable row level security;
alter table public.projects enable row level security;
alter table public.project_requirements enable row level security;
alter table public.project_milestones enable row level security;
alter table public.contractor_rfps enable row level security;
alter table public.worker_project_invitations enable row level security;
alter table public.worker_project_assignments enable row level security;
alter table public.attendance enable row level security;
alter table public.wage_records enable row level security;
alter table public.earnings enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.savings_goals enable row level security;
alter table public.savings_contributions enable row level security;

-- Open permissive policies for hackathon demo mode
create policy "Allow all access to profiles" on public.profiles for all using (true) with check (true);
create policy "Allow all access to employers" on public.employers for all using (true) with check (true);
create policy "Allow all access to contractors" on public.contractors for all using (true) with check (true);
create policy "Allow all access to workers" on public.workers for all using (true) with check (true);
create policy "Allow all access to projects" on public.projects for all using (true) with check (true);
create policy "Allow all access to project_requirements" on public.project_requirements for all using (true) with check (true);
create policy "Allow all access to project_milestones" on public.project_milestones for all using (true) with check (true);
create policy "Allow all access to contractor_rfps" on public.contractor_rfps for all using (true) with check (true);
create policy "Allow all access to worker_project_invitations" on public.worker_project_invitations for all using (true) with check (true);
create policy "Allow all access to worker_project_assignments" on public.worker_project_assignments for all using (true) with check (true);
create policy "Allow all access to attendance" on public.attendance for all using (true) with check (true);
create policy "Allow all access to wage_records" on public.wage_records for all using (true) with check (true);
create policy "Allow all access to earnings" on public.earnings for all using (true) with check (true);
create policy "Allow all access to conversations" on public.conversations for all using (true) with check (true);
create policy "Allow all access to conversation_participants" on public.conversation_participants for all using (true) with check (true);
create policy "Allow all access to messages" on public.messages for all using (true) with check (true);
create policy "Allow all access to notifications" on public.notifications for all using (true) with check (true);
create policy "Allow all access to savings_goals" on public.savings_goals for all using (true) with check (true);
create policy "Allow all access to savings_contributions" on public.savings_contributions for all using (true) with check (true);

-- Enable Supabase Realtime publication
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end
$$;

alter publication supabase_realtime add table 
  public.projects,
  public.contractor_rfps,
  public.worker_project_invitations,
  public.worker_project_assignments,
  public.attendance,
  public.wage_records,
  public.messages,
  public.notifications,
  public.savings_goals,
  public.savings_contributions;
