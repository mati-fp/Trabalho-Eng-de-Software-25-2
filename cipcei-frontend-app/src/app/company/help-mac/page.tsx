"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import WindowsGuide from "./components/WindowsGuide";
import MacOSGuide from "./components/MacOSGuide";
import LinuxGuide from "./components/LinuxGuide";

type TabType = "windows" | "macos" | "linux";

export default function HelpMacPage() {
  const [activeTab, setActiveTab] = useState<TabType>("windows");

  const tabs = [
    { id: "windows" as TabType, label: "Windows" },
    { id: "macos" as TabType, label: "macOS" },
    { id: "linux" as TabType, label: "Linux" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "windows":
        return <WindowsGuide />;
      case "macos":
        return <MacOSGuide />;
      case "linux":
        return <LinuxGuide />;
      default:
        return <WindowsGuide />;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Como Obter o Endereço MAC
          </CardTitle>
          <CardDescription>
            Siga as instruções abaixo de acordo com o seu sistema operacional
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-4 py-2 text-sm font-medium transition-colors
                  border-b-2 -mb-[1px]
                  ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="min-h-[300px]">
            {renderContent()}
          </div>

          {/* Observações Importantes */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                  Observações Importantes
                </h4>
                <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200 list-disc list-inside">
                  <li>O endereço MAC é único para cada placa de rede</li>
                  <li>Formato pode variar: 00:1A:2B ou 00-1A-2B</li>
                  <li>Wi-Fi e Ethernet têm MACs diferentes</li>
                  <li>Use o MAC da interface que usará na rede</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

