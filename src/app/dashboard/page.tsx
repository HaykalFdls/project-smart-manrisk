"use client";

import { BarChart as BarChartIcon, Activity, PieChart, TrendingUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Pie,
  PieChart as RePieChart,
  Cell,
} from "recharts";

export default function DashboardPage() {
  // Dummy data
  const kpiData = [
    { title: "Risk % >= Threshold", value: "55%", Icon: Activity, color: "bg-blue-500" },
    { title: "# of Risks >= Threshold", value: "35%", Icon: TrendingUp, color: "bg-sky-500" },
    { title: "Risk Analysis Progress", value: "32%", Icon: BarChartIcon, color: "bg-orange-500" },
    { title: "Response Progress", value: "89%", Icon: PieChart, color: "bg-purple-500" },
  ];

  const vulnerabilities = [
    { name: "Data Label 1", value: 4 },
    { name: "Data Label 2", value: 2 },
    { name: "Data Label 3", value: 3 },
    { name: "Data Label 4", value: 4 },
    { name: "Data Label 5", value: 4 },
  ];

  const entities = [
    { name: "Data Label 1", value: 4 },
    { name: "Data Label 2", value: 2 },
    { name: "Data Label 3", value: 3 },
    { name: "Data Label 4", value: 4 },
    { name: "Data Label 5", value: 5 },
  ];

  const actionPlans = [
    { name: "Preferred", value: 4 },
    { name: "Implemented", value: 2 },
    { name: "Planned", value: 3 },
    { name: "TBD", value: 4 },
  ];

  const riskRating = [
    { name: "Low Risk", value: 30, color: "#4ade80" },
    { name: "Medium Risk", value: 20, color: "#facc15" },
    { name: "High Risk", value: 10, color: "#f97316" },
    { name: "Critical Risk", value: 5, color: "#a855f7" },
  ];

  return (
    <div className="flex flex-col p-6 space-y-6">
      <h1 className="text-3xl font-bold">Risk Management Dashboard</h1>

      {/* KPI Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi, i) => (
          <Card key={i} className="p-4">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.Icon className={`h-6 w-6 text-white p-1 rounded ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>#Risks &gt;= Threshold: Top 5 Vulnerabilities</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vulnerabilities}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>#Risks &gt;= Threshold: Top 5 Entities</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={entities}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#06b6d4" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Heatmap Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Heat Map</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground">(Heatmap component goes here)</div>
          </CardContent>
        </Card>

        {/* Action Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Action Plan Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={actionPlans}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Rating */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Rating Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie data={riskRating} dataKey="value" nameKey="name" outerRadius={80} label>
                  {riskRating.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
