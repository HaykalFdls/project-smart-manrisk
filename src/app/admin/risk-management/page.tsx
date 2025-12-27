"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  fetchUsers,
  fetchRisks,
} from "@/lib/risk-register";
import { useAuth } from "@/context/auth-context";
import { Risk } from "@/types/risk";
import { User } from "@/types/user";

import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import MasterRiskForm from "@/components/riskregister/MasterRiskForm";
import { toast } from "@/hooks/use-toast";

// 🔍 Detect entry master only
function isMasterOnly(risk: Risk) {
  return (
    risk.kategori_risiko &&
    // !risk.jenis_risiko &&
    // !risk.skenario_risiko &&
    !risk.root_cause &&
    !risk.dampak &&
    risk.status === "draft"
  );
}

export default function RiskRegisterPage() {
  const { fetchWithAuth } = useAuth();
  const [risks, setRisks] = useState<Risk[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState<string>("all");

  // Map: user.id → unit name
  const userDivisionMap = Object.fromEntries(
    users.map((u) => [u.id, u.unit_name])
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const [risksData, usersData] = await Promise.all([
          fetchRisks(fetchWithAuth),
          fetchUsers(fetchWithAuth),
        ]);

        setRisks(risksData);
        setUsers(usersData);
      } catch {
        toast({
          title: "Error",
          description: "Gagal memuat data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchWithAuth]);

// 🔍 Filter data: hanya tampilkan master (belum lengkap)
const masterOnly = risks.filter((r) => isMasterOnly(r));

const filteredRisks =
  selectedUnit === "all"
    ? masterOnly
    : masterOnly.filter(
        (r) =>
          userDivisionMap[r.pemilik_risiko]?.toLowerCase() ===
          selectedUnit.toLowerCase()
      );


  return (
    <div className="py-4 px-4">
      <PageHeader
        title="RISK REGISTER"
        description="Kelola Risk Register / Potensi Risiko"
      >
        <div className="flex gap-2">
          <MasterRiskForm
            fetchWithAuth={fetchWithAuth}
            onSuccess={() => fetchRisks(fetchWithAuth).then(setRisks)}
          />
        </div>
      </PageHeader>


      <div className="my-4 flex gap-3">
        <select
          className="border px-3 py-2 rounded-md"
          value={selectedUnit}
          onChange={(e) => setSelectedUnit(e.target.value)}
        >
          <option value="all">Semua Unit Kerja</option>
          {Array.from(new Set(users.map((u) => u.unit_name))).map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
      </div>

      <Card>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No.</TableHead>
                <TableHead>Kategori Risiko</TableHead>
                <TableHead>Status Entry</TableHead>
                <TableHead>Risiko Residual</TableHead>
                <TableHead>Unit Kerja</TableHead>
                <TableHead>Pemilik Risiko</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredRisks.map((risk) => (
                <TableRow key={risk.id}>
                  <TableCell>{risk.id}</TableCell>

                  <TableCell className="font-semibold">
                    {risk.kategori_risiko}
                  </TableCell>

                  {/*  Status Master atau Lengkap */}
                  <TableCell>
                    {isMasterOnly(risk) ? (
                      <Badge variant="outline" className="bg-gray-100 text-gray-700">
                        Belum Lengkap
                      </Badge>
                    ) : (
                      <Badge variant="success">Lengkap</Badge>
                    )}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        risk.risiko_residual === "Tinggi" ||
                        risk.risiko_residual === "Sangat Tinggi"
                          ? "destructive"
                          : risk.risiko_residual === "Menengah"
                          ? "warning"
                          : "success"
                      }
                      className="capitalize"
                    >
                      {risk.risiko_residual || "-"}
                    </Badge>
                  </TableCell>

                  <TableCell>{risk.unit_kerja || "-"}</TableCell>

                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{risk.pemilik_nama || "-"}</span>
                      <Badge variant="outline" className="w-fit mt-1">
                        {risk.jabatan || "–"}
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {!filteredRisks.length && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-gray-400">
                    Tidak ada data untuk filter ini.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
