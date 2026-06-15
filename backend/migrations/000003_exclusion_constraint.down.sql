ALTER TABLE meetings DROP CONSTRAINT IF EXISTS meetings_no_overlap;
ALTER TABLE meetings DROP COLUMN IF EXISTS duration_minutes;
