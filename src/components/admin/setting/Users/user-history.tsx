"use client";

import { Card } from "@/components/ui/card";

type UserLogin = {
  id: number;
  user_id: number;
  user_name: string;
  login_time: string;
  logout_time: string | null;
  ip_address: string;
  user_agent: string;
  role_name: string;
  unit_name: string;
};

export default function UserLoginHistory({ userLogins }: { userLogins: UserLogin[] }) {
  return (
    <Card className="p-6 w-full shadow-md">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1">Riwayat Login User</h2>
        <p className="text-sm text-gray-500">
          Aktivitas login dan logout pengguna sistem
        </p>
      </div>

      {userLogins.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          Belum ada riwayat login.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-700 border-b">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Login Time</th>
                <th className="p-3">Logout Time</th>
                <th className="p-3">IP Address</th>
                <th className="p-3">User Agent</th>
                <th className="p-3">Role</th>
                <th className="p-3">Unit</th>
              </tr>
            </thead>
            <tbody>
              {userLogins.map((log) => (
                <tr key={log.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-800">{log.user_name}</td>
                  <td className="p-3 text-gray-600">{formatDate(log.login_time)}</td>
                  <td className="p-3 text-gray-600">
                    {log.logout_time ? formatDate(log.logout_time) : "—"}
                  </td>
                  <td className="p-3 text-gray-600">{log.ip_address}</td>
                  <td className="p-3 text-gray-600 truncate max-w-[150px]">
                    {log.user_agent}
                  </td>
                  <td className="p-3">{log.role_name}</td>
                  <td className="p-3">{log.unit_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString("id-ID", {
    dateStyle: "short",
    timeStyle: "short",
  });
}
