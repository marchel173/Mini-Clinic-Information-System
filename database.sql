-- =========================================================
-- Mini Clinic Information System - Database Schema
-- Compatible with PostgreSQL (default) — MySQL notes in README
-- =========================================================

CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    username        VARCHAR(50) UNIQUE NOT NULL,
    password        VARCHAR(255) NOT NULL,
    name            VARCHAR(100) NOT NULL,
    role            VARCHAR(20) NOT NULL CHECK (role IN ('administrator','dokter','petugas_pendaftaran')),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS polis (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    queue_prefix    VARCHAR(5) NOT NULL,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS doctors (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,
    poli_id         INTEGER REFERENCES polis(id) ON DELETE SET NULL,
    name            VARCHAR(100) NOT NULL,
    sip_number      VARCHAR(50),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patients (
    id                  SERIAL PRIMARY KEY,
    medical_record_no   VARCHAR(20) UNIQUE NOT NULL,
    nik                 VARCHAR(16) UNIQUE NOT NULL,
    name                VARCHAR(100) NOT NULL,
    gender              VARCHAR(1) NOT NULL CHECK (gender IN ('L','P')),
    birth_date          DATE NOT NULL,
    phone               VARCHAR(20),
    address             TEXT,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS registrations (
    id                  SERIAL PRIMARY KEY,
    patient_id          INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id           INTEGER REFERENCES doctors(id),
    poli_id             INTEGER NOT NULL REFERENCES polis(id),
    visit_date          DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_type        VARCHAR(30) NOT NULL CHECK (payment_type IN ('Umum','BPJS','Asuransi')),
    initial_complaint   TEXT,
    status              VARCHAR(20) NOT NULL DEFAULT 'Menunggu'
                         CHECK (status IN ('Menunggu','Check In','Pemeriksaan','Selesai')),
    created_by          INTEGER REFERENCES users(id),
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS queues (
    id                  SERIAL PRIMARY KEY,
    registration_id     INTEGER NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    poli_id             INTEGER NOT NULL REFERENCES polis(id),
    queue_number         VARCHAR(10) NOT NULL,
    queue_date          DATE NOT NULL DEFAULT CURRENT_DATE,
    status              VARCHAR(20) NOT NULL DEFAULT 'Menunggu'
                         CHECK (status IN ('Menunggu','Dipanggil','Selesai','Batal')),
    called_at           TIMESTAMP,
    created_at          TIMESTAMP DEFAULT NOW(),
    UNIQUE (poli_id, queue_date, queue_number)
);

CREATE TABLE IF NOT EXISTS medical_records (
    id                  SERIAL PRIMARY KEY,
    registration_id     INTEGER NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    patient_id          INTEGER NOT NULL REFERENCES patients(id),
    doctor_id           INTEGER REFERENCES doctors(id),
    -- Subjective
    complaint           TEXT,
    -- Objective
    blood_pressure      VARCHAR(20),
    temperature         NUMERIC(4,1),
    weight              NUMERIC(5,2),
    height              NUMERIC(5,2),
    -- Assessment
    diagnosis           TEXT,
    -- Plan
    therapy_plan        TEXT,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medical_actions (
    id                  SERIAL PRIMARY KEY,
    medical_record_id   INTEGER NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    action_name         VARCHAR(150) NOT NULL,
    notes               TEXT,
    created_at          TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prescriptions (
    id                  SERIAL PRIMARY KEY,
    medical_record_id   INTEGER NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    medicine_name       VARCHAR(150) NOT NULL,
    dosage              VARCHAR(100),
    quantity            VARCHAR(50),
    instructions        TEXT,
    created_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_patients_name ON patients(name);
CREATE INDEX idx_registrations_date ON registrations(visit_date);
CREATE INDEX idx_queues_date ON queues(queue_date, poli_id);
CREATE INDEX idx_medical_records_patient ON medical_records(patient_id);

-- =========================================================
-- Seed Data (master data only)
-- User accounts & doctor accounts are seeded via `npm run seed`
-- (backend/src/seed.js) so passwords are properly bcrypt-hashed
-- instead of being hardcoded in plain SQL.
-- =========================================================

INSERT INTO polis (name, queue_prefix) VALUES
('Poli Umum', 'A'),
('Poli Gigi', 'B'),
('Poli Anak', 'C');