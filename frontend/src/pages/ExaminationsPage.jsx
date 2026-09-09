import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";

const emptyForm = {
  complaint: "",
  blood_pressure: "",
  temperature: "",
  weight: "",
  height: "",
  diagnosis: "",
  therapy_plan: "",
};

export default function ExaminationsPage() {
  const [waitingRegistrations, setWaitingRegistrations] = useState([]);
  const [selectedReg, setSelectedReg] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [actions, setActions] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [history, setHistory] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  const loadWaiting = async () => {
    const res = await api.get("/registrations", {
      params: {
        date: new Date().toISOString().slice(0, 10),
        status: "Check In",
      },
    });
    setWaitingRegistrations(res.data.data.items);
  };

  useEffect(() => {
    loadWaiting();
  }, []);

  const selectRegistration = async (reg) => {
    setSelectedReg(reg);
    setForm({ ...emptyForm, complaint: reg.initial_complaint || "" });
    setActions([]);
    setPrescriptions([]);
    setErrors({});
    setSuccessMsg("");
    const historyRes = await api.get(`/medical-records/${reg.patient_id}`);
    setHistory(historyRes.data.data);
  };

  const addAction = () =>
    setActions([...actions, { action_name: "", notes: "" }]);
  const updateAction = (idx, field, value) => {
    const copy = [...actions];
    copy[idx][field] = value;
    setActions(copy);
  };
  const removeAction = (idx) => setActions(actions.filter((_, i) => i !== idx));

  const addPrescription = () =>
    setPrescriptions([
      ...prescriptions,
      { medicine_name: "", dosage: "", quantity: "", instructions: "" },
    ]);
  const updatePrescription = (idx, field, value) => {
    const copy = [...prescriptions];
    copy[idx][field] = value;
    setPrescriptions(copy);
  };
  const removePrescription = (idx) =>
    setPrescriptions(prescriptions.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMsg("");
    try {
      await api.post("/medical-records", {
        registration_id: selectedReg.id,
        ...form,
        actions: actions.filter((a) => a.action_name),
        prescriptions: prescriptions.filter((p) => p.medicine_name),
      });
      setSuccessMsg("Rekam medis berhasil disimpan.");
      setSelectedReg(null);
      loadWaiting();
    } catch (err) {
      setErrors(
        err.response?.data?.errors || {
          general: "Gagal menyimpan rekam medis",
        },
      );
    }
  };

  return (
    <Layout>
      <h2>Pemeriksaan Dokter</h2>
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <div
        className="grid"
        style={{ gridTemplateColumns: "1fr 2fr", alignItems: "start" }}
      >
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Pasien Menunggu Pemeriksaan</h3>
          {waitingRegistrations.length === 0 && (
            <p style={{ color: "#6b7280" }}>Tidak ada pasien check-in.</p>
          )}
          {waitingRegistrations.map((r) => (
            <div
              key={r.id}
              onClick={() => selectRegistration(r)}
              style={{
                padding: 10,
                borderRadius: 6,
                marginBottom: 8,
                cursor: "pointer",
                background: selectedReg?.id === r.id ? "#dbeafe" : "#f9fafb",
              }}
            >
              <b>{r.patient_name}</b>
              <br />
              <small>
                {r.medical_record_no} • {r.poli_name}
              </small>
            </div>
          ))}
        </div>

        <div>
          {!selectedReg ? (
            <div className="card">
              <p>Pilih pasien di sebelah kiri untuk memulai pemeriksaan.</p>
            </div>
          ) : (
            <>
              <form
                className="card"
                onSubmit={handleSubmit}
                style={{ marginBottom: 16 }}
              >
                <h3 style={{ marginTop: 0 }}>
                  SOAP — {selectedReg.patient_name}
                </h3>
                {errors.general && (
                  <div className="alert alert-error">{errors.general}</div>
                )}

                <p>
                  <b>Subjective</b>
                </p>
                <div className="form-group">
                  <label>Keluhan Pasien</label>
                  <textarea
                    rows={2}
                    value={form.complaint}
                    onChange={(e) =>
                      setForm({ ...form, complaint: e.target.value })
                    }
                  />
                </div>

                <p>
                  <b>Objective</b>
                </p>
                <div className="form-row">
                  <div className="form-group">
                    <label>Tekanan Darah</label>
                    <input
                      placeholder="120/80"
                      value={form.blood_pressure}
                      onChange={(e) =>
                        setForm({ ...form, blood_pressure: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Suhu Tubuh (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.temperature}
                      onChange={(e) =>
                        setForm({ ...form, temperature: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Berat Badan (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.weight}
                      onChange={(e) =>
                        setForm({ ...form, weight: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Tinggi Badan (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.height}
                      onChange={(e) =>
                        setForm({ ...form, height: e.target.value })
                      }
                    />
                  </div>
                </div>

                <p>
                  <b>Assessment</b>
                </p>
                <div className="form-group">
                  <label>Diagnosa</label>
                  <textarea
                    rows={2}
                    value={form.diagnosis}
                    onChange={(e) =>
                      setForm({ ...form, diagnosis: e.target.value })
                    }
                  />
                </div>

                <p>
                  <b>Plan</b>
                </p>
                <div className="form-group">
                  <label>Rencana Terapi</label>
                  <textarea
                    rows={2}
                    value={form.therapy_plan}
                    onChange={(e) =>
                      setForm({ ...form, therapy_plan: e.target.value })
                    }
                  />
                </div>

                <p>
                  <b>Tindakan Medis</b>
                </p>
                {actions.map((a, idx) => (
                  <div
                    key={idx}
                    className="form-row"
                    style={{ alignItems: "center" }}
                  >
                    <div className="form-group">
                      <input
                        placeholder="Nama tindakan"
                        value={a.action_name}
                        onChange={(e) =>
                          updateAction(idx, "action_name", e.target.value)
                        }
                      />
                    </div>
                    <div className="form-group">
                      <input
                        placeholder="Catatan"
                        value={a.notes}
                        onChange={(e) =>
                          updateAction(idx, "notes", e.target.value)
                        }
                      />
                    </div>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => removeAction(idx)}
                    >
                      x
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={addAction}
                >
                  + Tambah Tindakan
                </button>

                <p style={{ marginTop: 16 }}>
                  <b>Resep Obat</b>
                </p>
                {prescriptions.map((p, idx) => (
                  <div
                    key={idx}
                    className="form-row"
                    style={{ alignItems: "center" }}
                  >
                    <div className="form-group">
                      <input
                        placeholder="Nama obat"
                        value={p.medicine_name}
                        onChange={(e) =>
                          updatePrescription(
                            idx,
                            "medicine_name",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="form-group">
                      <input
                        placeholder="Dosis"
                        value={p.dosage}
                        onChange={(e) =>
                          updatePrescription(idx, "dosage", e.target.value)
                        }
                      />
                    </div>
                    <div className="form-group">
                      <input
                        placeholder="Jumlah"
                        value={p.quantity}
                        onChange={(e) =>
                          updatePrescription(idx, "quantity", e.target.value)
                        }
                      />
                    </div>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => removePrescription(idx)}
                    >
                      x
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={addPrescription}
                >
                  + Tambah Obat
                </button>

                <div style={{ marginTop: 20, textAlign: "right" }}>
                  <button className="btn btn-primary">
                    Simpan Rekam Medis
                  </button>
                </div>
              </form>

              <div className="card">
                <h3 style={{ marginTop: 0 }}>Riwayat Pemeriksaan</h3>
                {history.length === 0 ? (
                  <p style={{ color: "#6b7280" }}>Belum ada riwayat.</p>
                ) : (
                  history.map((h) => (
                    <div
                      key={h.id}
                      style={{
                        borderBottom: "1px solid #e5e7eb",
                        padding: "10px 0",
                      }}
                    >
                      <small>
                        {new Date(h.created_at).toLocaleString("id-ID")} •{" "}
                        {h.doctor_name}
                      </small>
                      <p style={{ margin: "4px 0" }}>
                        <b>Diagnosa:</b> {h.diagnosis || "-"}
                      </p>
                      <p style={{ margin: 0 }}>
                        <b>Terapi:</b> {h.therapy_plan || "-"}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
