"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/auth-context";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  draft: "#94a3b8",
  final: "#f59e0b",
  reviewed: "#3b82f6",
  approved: "#10b981",
  rejected: "#ef4444",
};

const PIE_COLORS = ["#64748b", "#f59e0b", "#3b82f6", "#10b981", "#ef4444"];

const hasPermissionValue = (value: unknown) => {
  if (value === true || value === 1) return true;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "1" || normalized === "true";
  }
  return false;
};

export default function Dashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState<any>({});
  const [charts, setCharts] = useState<any>({});
  const [meta, setMeta] = useState<any>({});
  const [risks, setRisks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isApprover = useMemo(() => {
    const role = user?.role_name || "";
    const canApprove = hasPermissionValue(user?.permissions?.can_approve);
    return canApprove || ["Super User", "Administrator", "Supervisor", "Executive Reviewer"].includes(role);
  }, [user]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, risksRes] = await Promise.all([
        fetch("http://localhost:5001/api/dashboard/stats", { credentials: "include" }),
        fetch(
          isApprover ? "http://localhost:5001/api/admin/risk-list" : "http://localhost:5001/risks",
          { credentials: "include" }
        ),
      ]);

      if (!statsRes.ok) throw new Error("Gagal mengambil statistik dashboard");
      if (!risksRes.ok) throw new Error("Gagal mengambil data risk");

      const statsJson = await statsRes.json();
      const risksJson = await risksRes.json();

      const rows = Array.isArray(risksJson?.data) ? risksJson.data : [];
      const normalized = rows.map((r: any) => ({
        id: r.id,
        unit_name: r.unit_name || "-",
        kategori_risiko: r.kategori_risiko || "-",
        jenis_risiko: r.jenis_risiko || "-",
        description: r.description || r.skenario_risiko || "-",
        tingkat_risiko: r.tingkat_risiko || "-",
        status: r.status || "draft",
      }));

      setStats(statsJson?.summary || {});
      setCharts(statsJson?.charts || {});
      setMeta(statsJson?.meta || {});
      setRisks(normalized);
    } catch (err: any) {
      console.error("Dashboard error:", err);
      setError(err?.message || "Terjadi kesalahan saat memuat dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadDashboard();
  }, [user?.id, isApprover]);

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      const res = await fetch("http://localhost:5001/api/admin/verify-risk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data?.message || "Gagal update status risk");
        return;
      }

      await loadDashboard();
    } catch (err) {
      console.error("Update status error:", err);
      setError("Gagal update status risk");
    }
  };

  const getRiskColor = (level: string) => {
    const lower = String(level || "").toLowerCase();
    if (lower.includes("sangat tinggi") || lower.includes("high")) return "bg-red-100 text-red-800";
    if (lower.includes("tinggi") || lower.includes("sedang") || lower.includes("medium")) return "bg-yellow-100 text-yellow-800";
    if (lower.includes("rendah") || lower.includes("low")) return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-700";
  };

  const getStatusBadge = (status: string) => {
    const s = String(status || "").toLowerCase();
    return `text-white ${STATUS_COLORS[s] ? "" : "bg-gray-500"}`;
  };

  const statusLabel = (status: string) => {
    const s = String(status || "").toLowerCase();
    if (s === "final") return "PENDING";
    if (s === "reviewed") return "IN PROGRESS";
    if (s === "approved") return "RESOLVED";
    return s.toUpperCase();
  };

  const cards = [
    { label: "Total Risks", value: stats.totalRisks || 0, color: "border-blue-500" },
    { label: "High Risks", value: stats.highRisks || 0, color: "border-red-500" },
    { label: "Medium Risks", value: stats.mediumRisks || 0, color: "border-yellow-500" },
    { label: "Low Risks", value: stats.lowRisks || 0, color: "border-green-500" },
    { label: "Pending Approval", value: stats.pendingApproval || 0, color: "border-amber-500" },
    { label: "In Progress", value: stats.inProgress || 0, color: "border-sky-500" },
    { label: "Resolved", value: stats.resolved || 0, color: "border-emerald-500" },
  ];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {user?.name} ({user?.role_name || "-"})
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Scope data: {meta?.scope === "all" ? "Semua Divisi" : `Divisi ${meta?.unit_name || "-"}`}
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div key={card.label} className={`bg-white rounded-lg shadow p-4 border-l-4 ${card.color}`}>
              <p className="text-sm text-gray-600">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Level (Bar Chart)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts?.byLevel || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Composition (Doughnut)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts?.byStatus || []}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={2}
                  >
                    {(charts?.byStatus || []).map((_: any, index: number) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {isApprover && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk by Divisi/Cabang</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={(charts?.byUnit || []).slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk by Kategori</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={(charts?.byCategory || []).slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">
              {isApprover ? "Risk Management Detail" : "Risk Divisi Anda"}
            </h2>
          </div>

          {risks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Divisi/Cabang</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Kategori</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Jenis Risiko</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Skenario</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Tingkat</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                    {isApprover && (
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Aksi</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {risks.map((r, idx) => (
                    <tr key={r.id} className={`border-b border-gray-200 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                      <td className="px-4 py-3 text-sm text-gray-900">{r.unit_name || "-"}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{r.kategori_risiko || "-"}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{r.jenis_risiko || "-"}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 max-w-sm truncate">{r.description || "-"}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getRiskColor(r.tingkat_risiko)}`}>
                          {r.tingkat_risiko || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(r.status)}`}
                          style={{ backgroundColor: STATUS_COLORS[String(r.status || "").toLowerCase()] || "#64748b" }}
                        >
                          {statusLabel(r.status)}
                        </span>
                      </td>
                      {isApprover && (
                        <td className="px-4 py-3 text-center">
                          <div className="flex gap-2 justify-center flex-wrap">
                            <button
                              onClick={() => updateStatus(r.id, "final")}
                              className="bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded text-xs font-semibold"
                            >
                              Final
                            </button>
                            <button
                              onClick={() => updateStatus(r.id, "approved")}
                              className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs font-semibold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateStatus(r.id, "rejected")}
                              className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-semibold"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">Tidak ada data risk untuk ditampilkan.</div>
          )}
        </div>
      </div>
    </div>
  );
}
