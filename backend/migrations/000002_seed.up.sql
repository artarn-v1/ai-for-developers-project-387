INSERT INTO owners (id, name, admin_slug, client_slug, time_zone)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Evgeny', 'evgeny-admin', 'evgeny', 'Europe/Moscow');

INSERT INTO meeting_types (id, owner_id, name, description, available_from, available_to, duration_minutes, slug, is_active)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Личное напоминание про масло', 'Напоминание о смене масла в автомобиле', '09:00', '18:00', 30, 'personal-oil-change', true);
