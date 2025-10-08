"use client";

import { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import AddUserDialog from "@/components/admin/setting/Users/AddUserDialog";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function UserTable({ users }: { users: User[] }) {
  const [openAdd, setOpenAdd] = useState(false);

  return (
    <Card className="p-6 w-full shadow-md">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold">Manajemen Pengguna</h2>
          <p className="text-sm text-gray-500">
            Melihat dan mengelola akun pengguna dan penetapan perannya
          </p>
        </div>
        <Button size="lg" onClick={() => setOpenAdd(true)}>
          + Add User
        </Button>
      </div>

      <AddUserDialog
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSuccess={() => {
          setOpenAdd(false);
          window.location.reload(); // atau panggil ulang fetch data
        }}
      />

      {users.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          Tidak ada data pengguna.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-base text-left">
            <thead className="text-gray-700 border-b">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Unit Kerja</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center font-medium text-lg">
                      {getInitials(user.name || user.email)}
                    </div>
                    <div>
                      <p className="font-medium text-base">{user.name}</p>
                      <p className="text-gray-500 text-sm">{user.user_id}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                      {user.role_name || "—"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        user.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{user.unit_name}</td>
                  <td className="p-4 text-right">
                    <button className="p-2 hover:bg-gray-200 rounded">
                      ⋮
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
