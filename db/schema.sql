-- Vínculo — esquema de base de datos (Supabase / Postgres)
-- Ejecutar en SQL Editor del proyecto. Reutiliza el corazón de Activate.

create extension if not exists "pgcrypto";

-- ============ ESCUELA Y PERSONAS ============
create table if not exists schools (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  lema text,
  logo_url text,
  colores jsonb default '{"magenta":"#D1006F","naranja":"#FF7A1A"}',
  created_at timestamptz default now()
);

create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  school_id uuid references schools(id),
  rol text not null check (rol in ('padre','estudiante','docente','preceptor','admin')),
  nombre text not null,
  apellido text,
  email text not null,
  telefono text,
  created_at timestamptz default now()
);

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) not null,
  profile_id uuid references profiles(id),         -- null si el alumno no usa la app
  nombre text not null,
  apellido text not null,
  dni text,
  fecha_nacimiento date,
  curso text not null,                              -- ej. '3° A'
  ficha_medica jsonb default '{}',                  -- grupo sanguíneo, alergias, obras social
  activo boolean default true,
  created_at timestamptz default now()
);

create table if not exists guardian_links (
  id uuid primary key default gen_random_uuid(),
  guardian_id uuid references profiles(id) not null, -- rol padre
  student_id uuid references students(id) not null,
  relacion text default 'responsable',              -- madre/padre/tutor/otro
  puede_firmar boolean default true,                -- autorizaciones
  recibe_notificaciones boolean default true,
  unique(guardian_id, student_id)
);

create table if not exists staff_assignments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) not null, -- docente o preceptor
  curso text,
  materia text,                                     -- null en preceptores
  unique(profile_id, curso, materia)
);

-- ============ ASISTENCIA ============
create table if not exists attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) not null,
  fecha date not null,
  estado text not null check (estado in ('P','A','T','J')), -- presente, ausente, tarde, justificado
  hora_llegada time,                                   -- si llegó tarde
  registrado_por uuid references profiles(id),
  justificacion text,
  justificacion_url text,                              -- foto certificado
  unique(student_id, fecha)
);
create index if not exists ix_att_fecha on attendance(fecha);

-- ============ DISCIPLINA ============
create table if not exists incidents (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) not null,
  tipo text not null check (tipo in ('conducta','uniforme','tarea','convivencia','otro')),
  gravedad text not null check (gravedad in ('leve','moderada','grave')),
  descripcion text not null,
  registrado_por uuid references profiles(id),
  requiere_firma boolean default true,
  created_at timestamptz default now()
);

create table if not exists incident_acknowledgments (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid references incidents(id) not null,
  guardian_id uuid references profiles(id) not null,
  firmado_at timestamptz default now(),
  unique(incident_id, guardian_id)
);

-- ============ COMUNICACIÓN ============
create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) not null,
  autor_id uuid references profiles(id),
  titulo text not null,
  cuerpo text not null,
  categoria text not null default 'general' check (categoria in ('general','urgente','charla','evento','autorizacion','tarea')),
  audiencia jsonb not null default '{"todos":true}', -- {todos} | {cursos:[..]} | {roles:[..]} | {alumnos:[..]}
  adjuntos jsonb default '[]',
  requiere_respuesta boolean default false,
  opciones jsonb,                                    -- ["Autorizo","No autorizo"]
  publicado_at timestamptz default now(),
  vence_at timestamptz
);

create table if not exists announcement_reads (
  announcement_id uuid references announcements(id) not null,
  profile_id uuid references profiles(id) not null,
  leido_at timestamptz default now(),
  primary key (announcement_id, profile_id)
);

create table if not exists announcement_responses (
  announcement_id uuid references announcements(id) not null,
  profile_id uuid references profiles(id) not null,
  student_id uuid references students(id),          -- sobre qué hijo respondió
  respuesta text not null,
  respondido_at timestamptz default now(),
  primary key (announcement_id, profile_id, student_id)
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) not null,
  titulo text not null,
  descripcion text,
  categoria text default 'eventos',
  fecha date not null,
  hora time,
  audiencia jsonb default '{"todos":true}',
  creado_por uuid references profiles(id)
);

create table if not exists gallery_photos (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id),
  storage_path text not null,
  subida_por uuid references profiles(id),
  created_at timestamptz default now()
);

-- ============ MENSAJERÍA POR SECTOR ============
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) not null,
  sector text not null,                             -- secretaria/pedagogico/preceptor/docente:<id>
  asunto text not null,
  student_id uuid references students(id),          -- sobre qué alumno es
  abierta_por uuid references profiles(id) not null, -- el padre/alumno
  asignada_a uuid references profiles(id),          -- staff que atiende
  estado text default 'nuevo' check (estado in ('nuevo','en curso','resuelto')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) not null,
  autor_id uuid references profiles(id) not null,
  cuerpo text not null,
  created_at timestamptz default now()
);

-- ============ NOTIFICACIONES ============
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) not null,
  tipo text not null,                               -- asistencia|nota|incidente|comunicado|evento|mensaje
  titulo text not null,
  cuerpo text not null,
  link text,                                        -- '#/asistencia' etc
  leida boolean default false,
  enviada_push boolean default false,
  created_at timestamptz default now()
);
create index if not exists ix_notif_user on notifications(profile_id, leida);

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) not null,
  endpoint text not null unique,
  keys jsonb not null,                              -- {p256dh, auth}
  created_at timestamptz default now()
);

create table if not exists notification_prefs (
  profile_id uuid primary key references profiles(id),
  asistencia boolean default true,
  notas boolean default true,
  incidentes boolean default true,
  comunicados boolean default true,
  eventos boolean default true,
  mensajes boolean default true,
  canal_email boolean default true
);

-- ============ NOTAS (resumen — esquema completo ya existe en Activate) ============
create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) not null,
  materia text not null,
  curso text not null,
  titulo text not null,
  tipo text,                                        -- TP / Evaluación / Cuestionario
  peso numeric(5,2),
  fecha date,
  docente_id uuid references profiles(id),
  term int default 1
);

create table if not exists grades (
  activity_id uuid references activities(id) not null,
  student_id uuid references students(id) not null,
  nota numeric(4,2),                                -- 0 = pendiente de entrega
  updated_at timestamptz default now(),
  updated_by uuid references profiles(id),
  primary key (activity_id, student_id)
);

-- ============ MOTOR DE NOTIFICACIONES ============
-- Cada evento crea una notificación por padre vinculado.
create or replace function notificar_padres_del_alumno(
  p_student uuid, p_tipo text, p_titulo text, p_cuerpo text, p_link text
) returns void language plpgsql security definer as $$
begin
  insert into notifications (profile_id, tipo, titulo, cuerpo, link)
  select gl.guardian_id, p_tipo, p_titulo, p_cuerpo, p_link
  from guardian_links gl
  join notification_prefs np on np.profile_id = gl.guardian_id
  where gl.student_id = p_student
    and gl.recibe_notificaciones
    and (p_tipo <> 'asistencia' or np.asistencia)
    and (p_tipo <> 'nota' or np.notas)
    and (p_tipo <> 'incidente' or np.incidentes);
end; $$;

-- Falta / llegada tarde → notifica a padres
create or replace function trg_attendance_notify() returns trigger language plpgsql security definer as $$
declare s students; e text;
begin
  if NEW.estado in ('A','T') then
    select * into s from students where id = NEW.student_id;
    e := case NEW.estado when 'A' then 'registró una falta' else 'llegó tarde' end;
    perform notificar_padres_del_alumno(
      NEW.student_id, 'asistencia',
      'Asistencia · ' || s.nombre || ' ' || s.apellido,
      s.nombre || ' ' || e || ' hoy (' || s.curso || ').',
      '#/asistencia');
  end if;
  return NEW;
end; $$;

drop trigger if exists attendance_notify on attendance;
create trigger attendance_notify after insert or update on attendance
  for each row execute function trg_attendance_notify();

-- Nota nueva → notifica a padres
create or replace function trg_grade_notify() returns trigger language plpgsql security definer as $$
declare a activities; s students; t text;
begin
  select * into a from activities where id = NEW.activity_id;
  select * into s from students where id = NEW.student_id;
  t := case when NEW.nota = 0 then 'pendiente de entrega' else NEW.nota::text end;
  perform notificar_padres_del_alumno(
    NEW.student_id, 'nota',
    'Nueva nota · ' || a.materia,
    a.titulo || ' — ' || t || ' (' || s.nombre || ', ' || s.curso || ').',
    '#/boletin');
  return NEW;
end; $$;

drop trigger if exists grade_notify on grades;
create trigger grade_notify after insert or update on grades
  for each row execute function trg_grade_notify();

-- Llamado de atención → notifica a padres
create or replace function trg_incident_notify() returns trigger language plpgsql security definer as $$
declare s students;
begin
  select * into s from students where id = NEW.student_id;
  perform notificar_padres_del_alumno(
    NEW.student_id, 'incidente',
    'Llamado de atención · ' || s.nombre,
    'Se registró un llamado (' || NEW.tipo || ', ' || NEW.gravedad || '). Revisalo y firmá.',
    '#/avisos');
  return NEW;
end; $$;

drop trigger if exists incident_notify on incidents;
create trigger incident_notify after insert on incidents
  for each row execute function trg_incident_notify();

-- Comunicado publicado → notifica a destinatarios
create or replace function trg_announcement_notify() returns trigger language plpgsql security definer as $$
declare uid uuid;
begin
  -- Candidatos: padres por curso de sus hijos, estudiantes con perfil,
  -- y staff según audiencia.
  for uid in
    select distinct p.id from profiles p
    join notification_prefs np on np.profile_id = p.id
    left join guardian_links gl on gl.guardian_id = p.id
    left join students s on s.id = gl.student_id
    left join staff_assignments sa on sa.profile_id = p.id
    where p.school_id = NEW.school_id
      and np.comunicados
      and (
        coalesce((NEW.audiencia->>'todos')::boolean, false)
        or p.rol::text = any (select jsonb_array_elements_text(coalesce(NEW.audiencia->'roles','[]'::jsonb)))
        or s.curso  = any (select jsonb_array_elements_text(coalesce(NEW.audiencia->'cursos','[]'::jsonb)))
        or sa.curso = any (select jsonb_array_elements_text(coalesce(NEW.audiencia->'cursos','[]'::jsonb)))
      )
  loop
    insert into notifications (profile_id, tipo, titulo, cuerpo, link)
    values (uid, 'comunicado', 'Nuevo comunicado', NEW.titulo, '#/inicio');
  end loop;
  return NEW;
end; $$;

drop trigger if exists announcement_notify on announcements;
create trigger announcement_notify after insert on announcements
  for each row execute function trg_announcement_notify();

-- ============ MATERIALES DESCARGABLES ============
create table if not exists materials (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) not null,
  curso text not null,
  materia text,
  titulo text not null,
  tipo text,                                       -- PDF / fotocopia / enlace
  storage_path text,                               -- archivo en Supabase Storage
  url_externa text,                                -- o link
  subida_por uuid references profiles(id),
  created_at timestamptz default now()
);
