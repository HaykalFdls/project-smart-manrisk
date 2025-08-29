"use client";

import { BarChart, CreditCard, DollarSign, Users } from "lucide-react";
import KpiCard from "@/components/dashboard/kpi-card";
import RiskChart from "@/components/dashboard/risk-chart";

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <h2 className="text-muted-foreground">
          Welcome to SMART Dashboard.
          {/* <h5 className="text-muted-foreground">
            created by: Manajemen Risiko
            </h5>  */}
        </h2>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <KpiCard
          title="Total Risks"
          value="1,254"
          description="+20.1% from last month"
          Icon={BarChart}
        />
        <KpiCard
          title="Open Issues"
          value="34"
          description="+180.1% from last month"
          Icon={Users}
          iconColor="text-red-500"
        />
        <KpiCard
          title="KRIs Breached"
          value="12"
          description="+19% from last month"
          Icon={CreditCard}
          iconColor="text-orange-500"
        />
        <KpiCard
          title="Potential Loss"
          value="$5.2M"
          description="+2 since last hour"
          Icon={DollarSign}
        />
      </div>

      {/* Risk Chart */}
      <div className="mt-8">
        <RiskChart />
      </div>
    </div>
  );
}
