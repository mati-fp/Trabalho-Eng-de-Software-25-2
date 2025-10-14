import Link from "next/link";

export default function Home() {
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
              className="inline-block bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
            >
              Ver Gerenciamento de IPs →
            </Link>
          </div>
          
        </div>
      </main>
    </div>
  );
}
