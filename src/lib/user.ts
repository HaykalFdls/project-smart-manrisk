// src/lib/user.ts
export async function fetchUsersWithAuth(fetchWithAuth: any) {
  try {
    const res = await fetchWithAuth("http://localhost:5000/users", {
      method: "GET",
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Error respons server:", text);
      throw new Error("Gagal mengambil data user");
    }

    const data = await res.json();
    console.log("Data user berhasil diambil:", data);
    return data;
  } catch (err) {
    console.error("fetchUsersWithAuth error:", err);
    throw err;
  }
}
