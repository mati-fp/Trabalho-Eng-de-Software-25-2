"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks";

export default function Home() {
  const router = useRouter();
  const { profile } = useAuth();

  useEffect(() => {
    if (profile?.role === "admin") {
      router.push("/admin/ips");
    } else {
      router.push("/company/ips");
    }
  }, [profile]);

  return (
    <></>
  );
}
