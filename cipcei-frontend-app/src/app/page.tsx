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
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg max-w-md mx-auto">
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Frontend configurado com sucesso!
            </p>
            <div className="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-400">
              <p>✓ Next.js 15 com App Router</p>
              <p>✓ TypeScript</p>
              <p>✓ Tailwind CSS</p>
              <p>✓ shadcn/ui</p>
              <p>✓ API Integration configurada</p>
            </div>
          </div>
          
          <p className="text-slate-500 dark:text-slate-500 text-sm mt-8">
            Pronto para desenvolvimento
          </p>
        </div>
      </main>
    </div>
  );
}
