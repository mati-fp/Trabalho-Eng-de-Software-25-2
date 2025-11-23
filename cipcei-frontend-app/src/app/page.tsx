"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(()=>{
    const token = localStorage.getItem("auth_token");
    if(!token){
      router.push("/login");
    } 
  }, [router]);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <main className="text-center px-4">
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            CIPCEI
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400">
            Sistema de Gerenciamento de IPs e Salas
          </p>
        </div>
        
        <div className="mt-12 space-y-4">

          <div className="mt-8">
            <Link
              href="/ips"
              className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Ver Gerenciamento de IPs →
            </Link>
          </div>
          
        </div>
      </main>
    </div>
  );
}
