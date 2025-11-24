import { useState, useEffect } from "react";
import { getAuthToken } from "@/lib/api";
import { decodeJWT, JWTPayload } from "@/lib/jwt";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  console.log({ profile })

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const tokenToDecode = token;
    if (!tokenToDecode) {
      router.push("/login");
      setProfile(null);
      setLoading(false);
      return;
    }

    const decoded = decodeJWT(tokenToDecode);

    if (decoded) {
      setProfile({
        name: (decoded.name as string) || "Usuário",
        email: (decoded.email as string) || "",
        role: (decoded.role as string) || "admin",
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

