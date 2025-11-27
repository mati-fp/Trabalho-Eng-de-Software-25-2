export default function WindowsGuide() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2 text-card-foreground">
          Método: Prompt de Comando
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Forma mais rápida e confiável
        </p>
        
        <ol className="list-decimal list-inside space-y-2 text-sm text-foreground">
          <li>Pressione <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Windows + R</kbd></li>
          <li>Digite <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">cmd</kbd> e pressione Enter</li>
          <li>No prompt, digite: <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">ipconfig /all</kbd></li>
          <li>Procure por &quot;Endereço Físico&quot; ou &quot;Physical Address&quot;</li>
          <li>O MAC aparecerá no formato: <span className="font-mono text-primary">00-1A-2B-3C-4D-5E</span></li>
        </ol>
      </div>
    </div>
  );
}

