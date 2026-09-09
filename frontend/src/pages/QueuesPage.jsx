import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";

const statusBadge = {
  Menunggu: "badge-waiting",
  Dipanggil: "badge-checkin",
  Selesai: "badge-done",
  Batal: "badge-waiting",
};

export default function QueuesPage() {
  const [queues, setQueues] = useState([]);
  const [polis, setPolis] = useState([]);
  const [poliFilter, setPoliFilter] = useState("");
  const [loading, setLoading] = useState(false);

  const loadQueues = async (poliId = poliFilter) => {
    setLoading(true);
    try {
      const res = await api.get("/queues", {
        params: poliId ? { poli_id: poliId } : {},
      });
      setQueues(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get("/master/polis").then((res) => setPolis(res.data.data));
    loadQueues();
    const interval = setInterval(() => loadQueues(), 10000); // auto refresh
    return () => clearInterval(interval);
  }, []);

  const currentlyCalled = queues.find((q) => q.status === "Dipanggil");
  const waitingList = queues.filter((q) => q.status === "Menunggu");

  const callNext = async () => {
    if (waitingList.length === 0) return;
    await api.put(`/queues/${waitingList[0].id}/call`);
    loadQueues();
  };

  const updateStatus = async (id, status) => {
    await api.put(`/queues/${id}/status`, { status });
    loadQueues();
  };

  return (
    <Layout>
      <div className="toolbar">
        <h2>Antrean Pasien Hari Ini</h2>
        <select
          style={{ maxWidth: 220 }}
          value={poliFilter}
          onChange={(e) => {
            setPoliFilter(e.target.value);
            loadQueues(e.target.value);
          }}
        >
          <option value="">Semua Poli</option>
          {polis.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div
        className="grid"
        style={{ gridTemplateColumns: "1fr 2fr", alignItems: "start" }}
      >
        <div className="card" style={{ textAlign: "center" }}>
          <p style={{ marginBottom: 4, color: "#6b7280" }}>Sedang Dipanggil</p>
          <div className="queue-number">
            {currentlyCalled ? currentlyCalled.queue_number : "-"}
          </div>
          <p style={{ marginTop: 4 }}>{currentlyCalled?.patient_name || ""}</p>
          <button
            className="btn btn-primary"
            style={{ marginTop: 16 }}
            onClick={callNext}
            disabled={waitingList.length === 0}
          >
            Panggil Antrean Berikutnya
          </button>
        </div>

        <div className="card">
          <table>
            <thead>
              <tr>
                <th>No. Antrean</th>
                <th>Pasien</th>
                <th>Poli</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5">Memuat...</td>
                </tr>
              ) : queues.length === 0 ? (
                <tr>
                  <td colSpan="5">Belum ada antrean hari ini</td>
                </tr>
              ) : (
                queues.map((q) => (
                  <tr key={q.id}>
                    <td>
                      <b>{q.queue_number}</b>
                    </td>
                    <td>{q.patient_name}</td>
                    <td>{q.poli_name}</td>
                    <td>
                      <span className={"badge " + statusBadge[q.status]}>
                        {q.status}
                      </span>
                    </td>
                    <td>
                      {q.status !== "Selesai" && q.status !== "Batal" && (
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => updateStatus(q.id, "Selesai")}
                        >
                          Selesai
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
