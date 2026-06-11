"use client";
import CustomLayout from "@/components/ui/custom-layout"
import { useAuth } from "@/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!profile) {
      router.push("/login");
    } else if (profile.role === "company") {
      router.push("/company/ips");
    }
  }, [profile, loading, router]);

  // Evita renderizar o conteudo admin (e disparar as chamadas de API das telas
  // filhas) antes de confirmar a sessao; o efeito acima cuida do redirect.
  if (loading || !profile || profile.role !== "admin") {
    return null;
  }

  return (
    <CustomLayout type="admin">
      {children}
    </CustomLayout>
  )
}