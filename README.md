# Vínculo — SuperApp escolar

La escuela y la familia, conectadas: comunicados, notas, asistencia y llamados de atención, con notificaciones push gratuitas.

- **App**: PWA en `index.html` + `app/` (vanilla JS ES2017, sin build). Paleta magenta `#D1006F` / naranja `#FF7A1A` / blanco / negro.
- **Backend**: Supabase — `db/schema.sql` (tablas + triggers del motor de notificaciones) y `db/policies.sql` (permisos por rol en la base).
- **Demo**: sin configurar Supabase la app corre en modo demo (botones por rol; código `1234`).
- **Roles**: padre, estudiante, docente, preceptor, admin (secretaría).

## Puesta en marcha
1. Crear proyecto en Supabase → copiar URL y anon key a `app/config.js`.
2. Correr `db/schema.sql` y `db/policies.sql` en el SQL Editor.
3. Cargar alumnos, padres y staff; invitar familias por e-mail + código.
4. Publicar en GitHub Pages.
