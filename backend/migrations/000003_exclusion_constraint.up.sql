CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE meetings ADD COLUMN duration_minutes INTEGER;

UPDATE meetings m
SET duration_minutes = mt.duration_minutes
FROM meeting_types mt
WHERE m.meeting_type_id = mt.id;

ALTER TABLE meetings ALTER COLUMN duration_minutes SET NOT NULL;

ALTER TABLE meetings
ADD CONSTRAINT meetings_no_overlap
EXCLUDE USING gist (
    meeting_type_id WITH =,
    tstzrange(start_date_time, start_date_time + duration_minutes * interval '1 minute') WITH &&
);
