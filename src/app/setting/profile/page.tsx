"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";

export default function ProfilePage() {
  const { fetchWithAuth, user } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetchWithAuth("http://localhost:5000/profile");
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error("Gagal ambil profile:", err);
      }
    };
    loadProfile();
  }, [fetchWithAuth]);

  if (!profile) return <div>Loading...</div>;

  return (
    <div>
      <h1>Profile</h1>
      <pre>{JSON.stringify(profile, null, 2)}</pre>
    </div>
  );
}
