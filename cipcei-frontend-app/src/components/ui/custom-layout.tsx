"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Ticket,
  Network,
  Database,
  Users,
  FileText,
  LogOut,
  Menu,
  X,
  User,
  Shield,
  ListChecks
} from "lucide-react";
import { getAuthToken, removeAuthToken } from "@/lib/api";
import { decodeJWT } from "@/lib/jwt";
import Link from "next/link";
import { useAuth } from "@/hooks";

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

const menuItemsAdmin: MenuItem[] = [
  { label: "Tabela de IPs", icon: <Database className="w-5 h-5" />, href: "/admin/ips" },
  { label: "Histórico", icon: <FileText className="w-5 h-5" />, href: "/admin/activities" },
  // { label: "Home", icon: <LayoutDashboard className="w-5 h-5" />, href: "/admin/home" },
  { label: "Solicitações", icon: <Ticket className="w-5 h-5" />, href: "/admin/requests" },
  { label: "Clientes", icon: <Users className="w-5 h-5" />, href: "/admin/clients" },
];

const menuItemsCompany: MenuItem[] = [
  { label: "Ips alocados", icon: <LayoutDashboard className="w-5 h-5" />, href: "/company/ips" },
  { label: "Solicitar IP", icon: <Ticket className="w-5 h-5" />, href: "/company/request-ip" },
  { label: "Solicitações", icon: <Ticket className="w-5 h-5" />, href: "/company/requests" },
  { label: "Ajuda (MAC)", icon: <Database className="w-5 h-5" />, href: "/company/help-mac" },
];

export default function CustomLayout({
  children,
  type,
}: {
  children: React.ReactNode;
  type: "admin" | "company";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const { profile } = useAuth();

  useEffect(() => {
    // Handle mobile responsiveness
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [router]);


  const handleLogout = () => {
    removeAuthToken();
    router.push("/login");
  };

  const userRoleLabel = profile?.role === "admin" ? "ADMINISTRADOR" : "EMPRESA";

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-64 bg-secondary
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          flex flex-col
        `}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-[var(--muted-foreground)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Network className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-muted font-bold text-lg">IP Manager</h1>
              <p className="text-muted text-xs">Sistema de Gestão</p>
            </div>
          </div>
        </div>

        {/* User Profile Section */}
        {profile && (
          <div className="px-6 py-3 border-b border-[var(--muted-foreground)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-muted font-semibold">
                {profile.role === "admin" ? (
                  <Shield className="w-6 h-6" />
                ) : (
                  <User className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-secondary-foreground font-semibold text-sm truncate">
                  {userRoleLabel}
                </p>
                <p className="text-muted text-xs truncate">
                  {profile.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {(type === "admin" ? menuItemsAdmin : menuItemsCompany).map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg
                      transition-colors duration-200
                      ${isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-secondary-foreground hover:bg-primary/20 hover:muted-foreground"
                      }
                    `}
                    onClick={() => isMobile && setSidebarOpen(false)}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-[var(--muted-foreground)]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-secondary-foreground hover:bg-primary/20 hover:text-muted transition-colors duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
          <h1 className="text-lg font-semibold">IP Manager</h1>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}