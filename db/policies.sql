-- Vínculo — Row Level Security: los permisos viven acá, no en la pantalla.
alter table profiles enable row level security;
alter table students enable row level security;
alter table guardian_links enable row level security;
alter table staff_assignments enable row level security;
alter table attendance enable row level security;
alter table incidents enable row level security;
alter table announcements enable row level security;
alter table announcement_reads enable row level security;
alter table announcement_responses enable row level security;
alter table events enable row level security;
alter table gallery_photos enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;
alter table push_subscriptions enable row level security;
alter table notification_prefs enable row level security;
alter table activities enable row level security;
alter table grades enable row level security;

-- helpers
create or replace function mi_rol() returns text language sql stable as
$$ select rol from profiles where id = auth.uid() $$;

create or replace function es_hijo_mio(p_student uuid) returns boolean language sql stable as
$$ select exists(select 1 from guardian_links
  where guardian_id = auth.uid() and student_id = p_student) $$;

create or replace function es_staff() returns boolean language sql stable as
$$ select mi_rol() in ('docente','preceptor','admin') $$;

-- profiles: cada uno ve su perfil; staff ve todos de la escuela; admin edita
create policy p_profiles_sel on profiles for select using (
  id = auth.uid() or es_staff());
create policy p_profiles_admin on profiles for all using (mi_rol() = 'admin');

-- students: padres solo sus hijos; staff y admin todo; estudiante su ficha
create policy p_students_sel on students for select using (
  es_hijo_mio(id) or es_staff() or profile_id = auth.uid());

-- guardian_links: el padre ve sus vínculos; admin gestiona
create policy p_links_sel on guardian_links for select using (
  guardian_id = auth.uid() or es_staff());
create policy p_links_admin on guardian_links for all using (mi_rol() = 'admin');

-- attendance: padre/staff/estudiante leen; preceptor/admin escriben
create policy p_att_sel on attendance for select using (
  es_hijo_mio(student_id) or es_staff());
create policy p_att_write on attendance for all using (mi_rol() in ('preceptor','admin'));

-- incidents: padre/staff leen; docente/preceptor/admin registran
create policy p_inc_sel on incidents for select using (
  es_hijo_mio(student_id) or es_staff());
create policy p_inc_write on incidents for insert with check (es_staff());
create policy p_ack_sel on incident_acknowledgments for select using (
  guardian_id = auth.uid() or es_staff());
create policy p_ack_ins on incident_acknowledgments for insert with check (
  guardian_id = auth.uid() and mi_rol() = 'padre');

-- announcements: todos leen; staff publica; lecturas/respuestas propias
create policy p_ann_sel on announcements for select using (true);
create policy p_ann_write on announcements for all using (es_staff());
create policy p_reads on announcement_reads for all using (
  profile_id = auth.uid() or es_staff());
create policy p_resp on announcement_responses for all using (
  profile_id = auth.uid() or es_staff());

-- events + galería: leen todos, escribe staff
create policy p_ev_sel on events for select using (true);
create policy p_ev_write on events for all using (es_staff());
create policy p_photos_sel on gallery_photos for select using (true);
create policy p_photos_write on gallery_photos for all using (es_staff());

-- conversaciones: el que la abrió + staff asignado/admin
create policy p_conv_sel on conversations for select using (
  abierta_por = auth.uid() or es_staff());
create policy p_conv_ins on conversations for insert with check (
  abierta_por = auth.uid() or es_staff());
create policy p_conv_upd on conversations for update using (es_staff());
create policy p_msg on messages for all using (
  exists(select 1 from conversations c
    where c.id = conversation_id
    and (c.abierta_por = auth.uid() or es_staff())));

-- notificaciones/push/prefs: solo el dueño
create policy p_notif on notifications for select using (profile_id = auth.uid());
create policy p_notif_upd on notifications for update using (profile_id = auth.uid());
create policy p_push on push_subscriptions for all using (profile_id = auth.uid());
create policy p_prefs on notification_prefs for all using (profile_id = auth.uid());

-- notas: docente escribe solo sus materias (staff_assignments); resto lee
create policy p_act_sel on activities for select using (true);
create policy p_act_write on activities for all using (
  exists(select 1 from staff_assignments sa
    where sa.profile_id = auth.uid()
    and sa.curso = activities.curso
    and sa.materia = activities.materia)
  or mi_rol() = 'admin');
create policy p_grades_sel on grades for select using (
  es_hijo_mio(student_id) or es_staff());
create policy p_grades_write on grades for all using (
  exists(select 1 from activities a
    join staff_assignments sa on sa.profile_id = auth.uid()
      and sa.curso = a.curso and sa.materia = a.materia
    where a.id = activity_id)
  or mi_rol() = 'admin');

alter table materials enable row level security;
create policy p_mat_sel on materials for select using (true);
create policy p_mat_write on materials for all using (es_staff());

alter table teacher_attendance enable row level security;
create policy p_ta_sel on teacher_attendance for select using (es_staff());
create policy p_ta_write on teacher_attendance for all using (mi_rol() in ('preceptor','admin','director'));
