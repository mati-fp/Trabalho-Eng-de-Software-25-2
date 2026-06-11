import { useState, useEffect } from "react";
import { getAuthToken } from "@/lib/api";
import { decodeJWT } from "@/lib/jwt";

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  sub?: string;
  companyId?: string;
}

export function useAuth() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    const decoded = token ? decodeJWT(token) : null;

    // Sem um papel (role) valido o token nao representa uma sessao utilizavel;
    // nao assumimos nenhum papel padrao (em especial, nunca 'admin').
    if (decoded?.role) {
      setProfile({
        name: (decoded.name as string) || "Usuário",
        email: (decoded.email as string) || "",
        role: decoded.role as string,
        sub: decoded.sub as string,
        companyId: decoded.companyId as string,
      });
    } else {
      setProfile(null);
    }

    setLoading(false);
  }, []);

  return { profile, loading };
}

