import { redirect } from "next/navigation";

export default function AdminPage() {
  // O painel admin nao tem uma tela propria; entra direto na tabela de IPs.
  redirect("/admin/ips");
}
