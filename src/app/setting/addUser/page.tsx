"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context"; // Asumsi Anda menggunakan context ini

type Role = {
  id: number;
  role_name: string;
};

type Unit = {
  id: number;
  unit_name: string;
};

export default function AddUserPage() {
  const router = useRouter();
  const { fetchWithAuth } = useAuth(); // Menggunakan fetchWithAuth untuk otentikasi
  const [formData, setFormData] = useState({
    user_id: "",
    name: "",
    email: "",
    password: "",
    unit_id: "",
    role_id: "",
    status: "active",
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Fetch roles and units data on component mount
  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const [rolesRes, unitsRes] = await Promise.all([
          fetch("http://localhost:5000/roles"),
          fetch("http://localhost:5000/units"),
        ]);

        if (!rolesRes.ok || !unitsRes.ok) {
          throw new Error("Gagal mengambil data roles atau units.");
        }

        const rolesData = await rolesRes.json();
        const unitsData = await unitsRes.json();

        setRoles(rolesData);
        setUnits(unitsData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setStatusMessage({ type: "error", text: "Gagal memuat data roles dan units." });
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchDependencies();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage({ type: "", text: "" });

    // Client-side validation
    if (!formData.user_id || !formData.name || !formData.email || !formData.password || !formData.role_id) {
      setStatusMessage({ type: "error", text: "Field user_id, Nama, Email, Password, dan Role wajib diisi." });
      setIsLoading(false);
      return;
    }

    try {
      // Menggunakan fetchWithAuth dari context Anda
      const response = await fetchWithAuth("http://localhost:5000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal menambahkan user.");
      }

      const result = await response.json();
      setStatusMessage({ type: "success", text: "✅ User berhasil ditambahkan!" });
      console.log("User added successfully:", result);
      setFormData({
        user_id: "",
        name: "",
        email: "",
        password: "",
        unit_id: "",
        role_id: "",
        status: "active",
      });
      // Opsional: Redirect ke halaman lain setelah sukses
      // router.push("/users"); 
    } catch (err: any) {
      console.error("Failed to add user:", err);
      setStatusMessage({ type: "error", text: `❌ Error: ${err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  if (isDataLoading) {
    return <p className="p-4 text-center">⏳ Sedang memuat data...</p>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-xl rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">Tambah User Baru</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="user_id" className="block text-sm font-medium text-gray-700">User ID</label>
            <input
              type="text"
              id="user_id"
              name="user_id"
              value={formData.user_id}
              onChange={handleChange}
              placeholder="Contoh: user_001"
              className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Contoh: John Doe"
              className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="contoh@domain.com"
              className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimal 8 karakter"
              className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="role_id" className="block text-sm font-medium text-gray-700">Role</label>
            <select
              id="role_id"
              name="role_id"
              value={formData.role_id}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="" disabled>Pilih Role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.role_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="unit_id" className="block text-sm font-medium text-gray-700">Unit (Opsional)</label>
            <select
              id="unit_id"
              name="unit_id"
              value={formData.unit_id}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Tidak ada Unit</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.unit_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {statusMessage.text && (
            <p className={`rounded-md p-3 text-sm font-medium ${
              statusMessage.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}>
              {statusMessage.text}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full rounded-md px-4 py-2 text-white transition-colors duration-200 ${
              isLoading ? "cursor-not-allowed bg-indigo-300" : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            }`}
          >
            {isLoading ? "Menambah..." : "Tambah User"}
          </button>
        </form>
      </div>
    </div>
  );
}