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
  const { profile } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (profile?.role === "company") {
      router.push("/company/ips");
    }
  }, [profile]);

  return (
    <CustomLayout type="admin">
      {children}
    </CustomLayout>
  )
}