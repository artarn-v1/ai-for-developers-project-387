CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE owners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    admin_slug TEXT NOT NULL UNIQUE,
    client_slug TEXT NOT NULL UNIQUE,
    time_zone TEXT NOT NULL DEFAULT 'UTC'
);

CREATE TABLE meeting_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    available_from TEXT NOT NULL DEFAULT '09:00',
    available_to TEXT NOT NULL DEFAULT '18:00',
    duration_minutes INTEGER NOT NULL,
    slug TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    UNIQUE(owner_id, slug)
);

CREATE TABLE participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL
);
CREATE UNIQUE INDEX idx_participants_email ON participants(LOWER(email));

CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_type_id UUID NOT NULL REFERENCES meeting_types(id) ON DELETE CASCADE,
    start_date_time TIMESTAMPTZ NOT NULL,
    comment TEXT NOT NULL DEFAULT '',
    initiator_id UUID NOT NULL REFERENCES participants(id),
    is_confirmed BOOLEAN
);

CREATE TABLE meeting_participants (
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES participants(id),
    PRIMARY KEY (meeting_id, participant_id)
);
