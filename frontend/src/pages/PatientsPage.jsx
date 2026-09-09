import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";

const emptyForm = {
  nik: "",
  name: "",
  gender: "L",
  birth_date: "",
  phone: "",
  address: "",
};

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [detailPatient, setDetailPatient] = useState(null);

  const loadPatients = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get("/patients", {
        params: { page, limit: 10, search },
      });
      setPatients(res.data.data.items);
      setPagination(res.data.data.pagination);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients(1);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadPatients(1);
  };

  const openAddModal = () => {
    setForm(emptyForm);
    setEditingId(null);
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (patient) => {
    setForm({
      nik: patient.nik,
      name: patient.name,
      gender: patient.gender,
      birth_date: patient.birth_date?.slice(0, 10),
      phone: patient.phone || "",
      address: patient.address || "",
    });
    setEditingId(patient.id);
    setErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      if (editingId) {
        await api.put(`/patients/${editingId}`, form);
      } else {
        await api.post("/patients", form);
      }
      setShowModal(false);
      loadPatients(pagination.page);
    } catch (err) {
      setErrors(
        err.response?.data?.errors || { general: "Gagal menyimpan data" },
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus data pasien ini?")) return;
    await api.delete(`/patients/${id}`);
    loadPatients(pagination.page);
  };

  const viewDetail = async (id) => {
    const res = await api.get(`/patients/${id}`);
    setDetailPatient(res.data.data);
  };

  return (
    <Layout>
      <div className="toolbar">
        <h2>Data Pasien</h2>
        <button className="btn btn-primary" onClick={openAddModal}>
          + Tambah Pasien
        </button>
      </div>

      <form onSubmit={handleSearch} style={{ marginBottom: 16 }}>
        <input
          placeholder="Cari nama, NIK, atau No. RM..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 320 }}
        />
      </form>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>No. RM</th>
              <th>NIK</th>
              <th>Nama</th>
              <th>JK</th>
              <th>Tgl Lahir</th>
              <th>Telepon</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7">Memuat...</td>
              </tr>
            ) : patients.length === 0 ? (
              <tr>
                <td colSpan="7">Tidak ada data pasien</td>
              </tr>
            ) : (
              patients.map((p) => (
                <tr key={p.id}>
                  <td>{p.medical_record_no}</td>
                  <td>{p.nik}</td>
                  <td>{p.name}</td>
                  <td>{p.gender}</td>
                  <td>{p.birth_date?.slice(0, 10)}</td>
                  <td>{p.phone}</td>
                  <td>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => viewDetail(p.id)}
                    >
                      Detail
                    </button>{" "}
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => openEditModal(p)}
                    >
                      Ubah
                    </button>{" "}
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(p.id)}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="pagination">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
            (p) => (
              <button
                key={p}
                className={
                  "btn btn-sm " +
                  (p === pagination.page ? "btn-primary" : "btn-outline")
                }
                onClick={() => loadPatients(p)}
              >
                {p}
              </button>
            ),
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? "Ubah Data Pasien" : "Tambah Data Pasien"}</h2>
            {errors.general && (
              <div className="alert alert-error">{errors.general}</div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>NIK</label>
                <input
                  maxLength={16}
                  value={form.nik}
                  onChange={(e) => setForm({ ...form, nik: e.target.value })}
                  required
                />
                {errors.nik && <div className="error-text">{errors.nik}</div>}
              </div>
              <div className="form-group">
                <label>Nama Pasien</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                {errors.name && <div className="error-text">{errors.name}</div>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Jenis Kelamin</label>
                  <select
                    value={form.gender}
                    onChange={(e) =>
                      setForm({ ...form, gender: e.target.value })
                    }
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Tanggal Lahir</label>
                  <input
                    type="date"
                    value={form.birth_date}
                    onChange={(e) =>
                      setForm({ ...form, birth_date: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Nomor Telepon</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Alamat</label>
                <textarea
                  rows={3}
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
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
                  Batal
                </button>
                <button className="btn btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailPatient && (
        <div className="modal-overlay" onClick={() => setDetailPatient(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Detail Pasien</h2>
            <p>
              <b>No. RM:</b> {detailPatient.medical_record_no}
            </p>
            <p>
              <b>NIK:</b> {detailPatient.nik}
            </p>
            <p>
              <b>Nama:</b> {detailPatient.name}
            </p>
            <p>
              <b>Jenis Kelamin:</b>{" "}
              {detailPatient.gender === "L" ? "Laki-laki" : "Perempuan"}
            </p>
            <p>
              <b>Tanggal Lahir:</b> {detailPatient.birth_date?.slice(0, 10)}
            </p>
            <p>
              <b>Telepon:</b> {detailPatient.phone || "-"}
            </p>
            <p>
              <b>Alamat:</b> {detailPatient.address || "-"}
            </p>
            <button
              className="btn btn-outline"
              onClick={() => setDetailPatient(null)}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
