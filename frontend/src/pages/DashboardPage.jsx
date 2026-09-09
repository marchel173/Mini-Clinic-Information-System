import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard")
      .then((res) => setStats(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        { label: "Total Pasien", value: stats.total_pasien },
        { label: "Total Pasien Hari Ini", value: stats.total_pasien_hari_ini },
        {
          label: "Total Antrean Hari Ini",
          value: stats.total_antrean_hari_ini,
        },
        { label: "Pasien Menunggu", value: stats.total_pasien_menunggu },
        { label: "Pasien Selesai Dilayani", value: stats.total_pasien_selesai },
      ]
    : [];

  return (
    <Layout>
      <h2>Dashboard</h2>
      {loading ? (
        <p>Memuat data...</p>
      ) : (
        <div className="grid grid-4">
          {cards.map((c) => (
            <div key={c.label} className="card stat-card">
              <div className="value">{c.value}</div>
              <div className="label">{c.label}</div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
