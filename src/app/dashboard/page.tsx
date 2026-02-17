"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role_id === 1;

  const [stats, setStats] = useState<any>({});
  const [risks, setRisks] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:5001/api/dashboard/stats", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => setStats(data.summary));
  }, []);

  useEffect(() => {
    if (!isAdmin) return;

    fetch("http://localhost:5001/api/admin/risk-list", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => setRisks(data.data));
  }, [isAdmin]);

  const updateStatus = async (id: number, status: string) => {
    await fetch("http://localhost:5001/api/admin/verify-risk", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id, status })
    });

    setRisks(risks.map(r => r.id === id ? { ...r, status } : r));
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {isAdmin && (
        <table className="w-full border">
          <thead>
            <tr>
              <th>Kategori</th>
              <th>Jenis</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {risks.map(r => (
              <tr key={r.id}>
                <td>{r.kategori_risiko}</td>
                <td>{r.jenis_risiko}</td>
                <td>{r.status}</td>
                <td>
                  <button
                    onClick={() => updateStatus(r.id, "approved")}
                    className="bg-green-600 text-white px-2 py-1 mr-2">
                    Approve
                  </button>
                  <button
                    onClick={() => updateStatus(r.id, "final")}
                    className="bg-red-600 text-white px-2 py-1">
                    Decline
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
