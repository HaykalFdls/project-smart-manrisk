"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";

type UserProfile = {
  id: number;
  name: string;
  email: string;
  role_id: number;
  role_name: string;
  unit_id: number | null;
  status: string;
};

export default function SettingPage() {
  const { user, isReady, isAuthenticated, fetchWithAuth, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady) return;

    if (!isAuthenticated) {
      // kalau belum login, jangan fetch
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetchWithAuth("http://localhost:5000/profile");
        if (!res.ok) throw new Error("Gagal ambil profile");

        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error("❌ Error ambil profile:", err);
        logout(); // auto logout kalau token invalid
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isReady, isAuthenticated, fetchWithAuth, logout]);

  if (!isReady) return <p className="p-4">⏳ Loading auth...</p>;
  if (!isAuthenticated) return <p className="p-4">⚠️ Anda harus login dulu</p>;
  if (loading) return <p className="p-4">⏳ Ambil data profile...</p>;

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">⚙️ Settings</h1>

      {profile ? (
        <div className="space-y-4">
          <div className="bg-white shadow p-4 rounded-lg">
            <p><strong>ID:</strong> {profile.id}</p>
            <p><strong>Name:</strong> {profile.name}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Role:</strong> {profile.role_name} (ID {profile.role_id})</p>
            <p><strong>Unit ID:</strong> {profile.unit_id ?? "-"}</p>
            <p><strong>Status:</strong> {profile.status}</p>
          </div>

          <button
            onClick={logout}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      ) : (
        <p className="text-gray-500">Tidak ada data user.</p>
      )}
    </div>
  );
}
