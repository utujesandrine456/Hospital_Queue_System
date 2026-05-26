ALTER TABLE tickets ADD COLUMN IF NOT EXISTS "patientId" TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS deferred BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS tickets_patient_id_idx ON tickets("patientId");
