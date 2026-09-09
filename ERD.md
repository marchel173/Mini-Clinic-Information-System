# Entity Relationship Diagram — Mini Clinic Information System

```mermaid
erDiagram
    USERS ||--o{ DOCTORS : "linked account (optional)"
    POLIS ||--o{ DOCTORS : "assigned to"
    POLIS ||--o{ REGISTRATIONS : "visited"
    POLIS ||--o{ QUEUES : "belongs to"
    PATIENTS ||--o{ REGISTRATIONS : "makes"
    DOCTORS ||--o{ REGISTRATIONS : "handles"
    REGISTRATIONS ||--|| QUEUES : "generates"
    REGISTRATIONS ||--o{ MEDICAL_RECORDS : "results in"
    PATIENTS ||--o{ MEDICAL_RECORDS : "has"
    DOCTORS ||--o{ MEDICAL_RECORDS : "examines"
    MEDICAL_RECORDS ||--o{ MEDICAL_ACTIONS : "includes"
    MEDICAL_RECORDS ||--o{ PRESCRIPTIONS : "includes"
    USERS ||--o{ REGISTRATIONS : "created by"

    USERS {
        int id PK
        varchar username UK
        varchar password
        varchar name
        varchar role "administrator|dokter|petugas_pendaftaran"
        boolean is_active
    }

    POLIS {
        int id PK
        varchar name
        varchar queue_prefix
    }

    DOCTORS {
        int id PK
        int user_id FK
        int poli_id FK
        varchar name
        varchar sip_number
        boolean is_active
    }

    PATIENTS {
        int id PK
        varchar medical_record_no UK "auto-generated"
        varchar nik UK
        varchar name
        varchar gender "L|P"
        date birth_date
        varchar phone
        text address
    }

    REGISTRATIONS {
        int id PK
        int patient_id FK
        int doctor_id FK
        int poli_id FK
        date visit_date
        varchar payment_type "Umum|BPJS|Asuransi"
        text initial_complaint
        varchar status "Menunggu|Check In|Pemeriksaan|Selesai"
        int created_by FK
    }

    QUEUES {
        int id PK
        int registration_id FK
        int poli_id FK
        varchar queue_number "e.g. A001"
        date queue_date
        varchar status "Menunggu|Dipanggil|Selesai|Batal"
        timestamp called_at
    }

    MEDICAL_RECORDS {
        int id PK
        int registration_id FK
        int patient_id FK
        int doctor_id FK
        text complaint "Subjective"
        varchar blood_pressure "Objective"
        numeric temperature "Objective"
        numeric weight "Objective"
        numeric height "Objective"
        text diagnosis "Assessment"
        text therapy_plan "Plan"
    }

    MEDICAL_ACTIONS {
        int id PK
        int medical_record_id FK
        varchar action_name
        text notes
    }

    PRESCRIPTIONS {
        int id PK
        int medical_record_id FK
        varchar medicine_name
        varchar dosage
        varchar quantity
        text instructions
    }
```

## Penjelasan Relasi

- **USERS → DOCTORS** (1:0..1): satu akun user dengan role `dokter` dapat memiliki satu data master dokter (opsional, agar admin/petugas tidak wajib punya profil dokter).
- **POLIS → DOCTORS** (1:N): satu poli dapat memiliki banyak dokter.
- **PATIENTS → REGISTRATIONS** (1:N): satu pasien dapat melakukan banyak kunjungan/pendaftaran.
- **REGISTRATIONS → QUEUES** (1:1): setiap pendaftaran otomatis menghasilkan satu nomor antrean.
- **REGISTRATIONS → MEDICAL_RECORDS** (1:N, umumnya 1:1 per kunjungan): hasil pemeriksaan dokter tercatat sebagai rekam medis yang terhubung ke pendaftaran terkait.
- **MEDICAL_RECORDS → MEDICAL_ACTIONS / PRESCRIPTIONS** (1:N): satu rekam medis dapat memiliki banyak tindakan medis dan banyak resep obat.
- **PATIENTS → MEDICAL_RECORDS** (1:N): digunakan untuk menampilkan riwayat pemeriksaan pasien di seluruh kunjungan.
