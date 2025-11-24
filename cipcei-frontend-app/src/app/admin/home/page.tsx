"use client";

import { Network, CheckCircle2, Database, Ticket, Users, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

function MetricCard({ title, value, icon }: MetricCardProps) {
  return (
    <Card className="p-3">
      <div className="flex items-center gap-2">
        <div className="bg-primary/10 text-primary p-3 rounded-lg">
          {icon}
        </div>
        <div >
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-foreground">{value}</h3>
        </div>
      </div>
    </Card>
  );
}

export default function AdminHomePage() {
  // Valores fictícios para as métricas
  const metrics = [
    {
      title: "Total de IPs",
      value: "254",
      icon: <Network className="w-4 h-4" />,
    },
    {
      title: "IPs Alocados",
      value: "178",
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    {
      title: "IPs Disponíveis",
      value: "76",
      icon: <Database className="w-4 h-4" />,
    },
    {
      title: "Pendentes",
      value: "12",
      icon: <Ticket className="w-4 h-4" />,
    },
    {
      title: "Empresas Ativas",
      value: "89",
      icon: <Users className="w-4 h-4" />,
    },
  ];

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Painel Administrativo
        </h1>
        <p className="text-muted-foreground">
          Visão geral do sistema de gerenciamento de IPs
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
          />
        ))}
      </div>

    </div>
  );
}
