import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  {
    to: "/dashboard",
    label: "Dashboard",
    roles: ["administrator", "dokter", "petugas_pendaftaran"],
  },
  {
    to: "/patients",
    label: "Data Pasien",
    roles: ["administrator", "petugas_pendaftaran"],
  },
  {
    to: "/registrations",
    label: "Pendaftaran",
    roles: ["administrator", "petugas_pendaftaran"],
  },
  {
    to: "/queues",
    label: "Antrean",
    roles: ["administrator", "petugas_pendaftaran", "dokter"],
  },
  { to: "/examinations", label: "Pemeriksaan", roles: ["dokter"] },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const visibleItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(user?.role),
  );

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">🏥 Mini Clinic</div>
        <nav>
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                "nav-link" + (isActive ? " active" : "")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="main">
        <header className="topbar">
          <div />
          <div className="user-info">
            <span>
              {user?.name} <em>({user?.role})</em>
            </span>
            <button onClick={handleLogout} className="btn btn-outline">
              Logout
            </button>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
