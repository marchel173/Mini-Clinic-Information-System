import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";

const emptyForm = {
  patient_id: "",
  doctor_id: "",
  poli_id: "",
  visit_date: "",
  payment_type: "Umum",
  initial_complaint: "",
};

const statusBadge = {
  Menunggu: "badge-waiting",
  "Check In": "badge-checkin",
  Pemeriksaan: "badge-exam",
  Selesai: "badge-done",
};

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [polis, setPolis] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const res = await api.get("/registrations", {
        params: { date: new Date().toISOString().slice(0, 10) },
      });
      setRegistrations(res.data.data.items);
    } finally {
      setLoading(false);
    }
  };

  const loadMasterData = async () => {
    const [patientsRes, doctorsRes, polisRes] = await Promise.all([
      api.get("/patients", { params: { limit: 100 } }),
      api.get("/master/doctors"),
      api.get("/master/polis"),
    ]);
    setPatients(patientsRes.data.data.items);
    setDoctors(doctorsRes.data.data);
    setPolis(polisRes.data.data);
  };

  useEffect(() => {
    loadRegistrations();
    loadMasterData();
  }, []);

  const openModal = () => {
    setForm(emptyForm);
    setErrors({});
    setSuccessMsg("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      const res = await api.post("/registrations", form);
      setSuccessMsg(
        `Pendaftaran berhasil. Nomor antrean: ${res.data.data.queue.queue_number}`,
      );
      loadRegistrations();
    } catch (err) {
      setErrors(
        err.response?.data?.errors || {
          general: "Gagal menyimpan pendaftaran",
        },
      );
    }
  };

  return (
    <Layout>
      <div className="toolbar">
        <h2>Pendaftaran Pasien (Hari Ini)</h2>
        <button className="btn btn-primary" onClick={openModal}>
          + Daftar Kunjungan Baru
        </button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>No. RM</th>
              <th>Nama Pasien</th>
              <th>Poli</th>
              <th>Dokter</th>
              <th>Bayar</th>
              <th>Keluhan</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7">Memuat...</td>
              </tr>
            ) : registrations.length === 0 ? (
              <tr>
                <td colSpan="7">Belum ada pendaftaran hari ini</td>
              </tr>
            ) : (
              registrations.map((r) => (
                <tr key={r.id}>
                  <td>{r.medical_record_no}</td>
                  <td>{r.patient_name}</td>
                  <td>{r.poli_name}</td>
                  <td>{r.doctor_name || "-"}</td>
                  <td>{r.payment_type}</td>
                  <td>{r.initial_complaint || "-"}</td>
                  <td>
                    <span className={"badge " + statusBadge[r.status]}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Pendaftaran Kunjungan Baru</h2>
            {errors.general && (
              <div className="alert alert-error">{errors.general}</div>
            )}
            {successMsg && (
              <div className="alert alert-success">{successMsg}</div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Pasien</label>
                <select
                  value={form.patient_id}
                  onChange={(e) =>
                    setForm({ ...form, patient_id: e.target.value })
                  }
                  required
                >
                  <option value="">-- Pilih Pasien --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.medical_record_no})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Poli</label>
                  <select
                    value={form.poli_id}
                    onChange={(e) =>
                      setForm({ ...form, poli_id: e.target.value })
                    }
                    required
                  >
                    <option value="">-- Pilih Poli --</option>
                    {polis.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Dokter</label>
                  <select
                    value={form.doctor_id}
                    onChange={(e) =>
                      setForm({ ...form, doctor_id: e.target.value })
                    }
                  >
                    <option value="">-- Pilih Dokter --</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Tanggal Kunjungan</label>
                  <input
                    type="date"
                    value={form.visit_date}
                    onChange={(e) =>
                      setForm({ ...form, visit_date: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Jenis Pembayaran</label>
                  <select
                    value={form.payment_type}
                    onChange={(e) =>
                      setForm({ ...form, payment_type: e.target.value })
                    }
                  >
                    <option value="Umum">Umum</option>
                    <option value="BPJS">BPJS</option>
                    <option value="Asuransi">Asuransi</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Keluhan Awal</label>
                <textarea
                  rows={2}
                  value={form.initial_complaint}
                  onChange={(e) =>
                    setForm({ ...form, initial_complaint: e.target.value })
                  }
                />
              </div>
              <div
                style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
              >
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowModal(false)}
                >
                  Tutup
                </button>
                <button className="btn btn-primary">Daftar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
