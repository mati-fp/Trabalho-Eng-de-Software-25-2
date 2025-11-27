export default function MacOSGuide() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2 text-card-foreground">
          Método: Terminal
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Forma mais rápida e confiável
        </p>
        
        <ol className="list-decimal list-inside space-y-2 text-sm text-foreground">
          <li>Abra o Terminal (Aplicativos &gt; Utilitários &gt; Terminal)</li>
          <li>Digite: <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">ifconfig</kbd></li>
          <li>Procure pela interface de rede (en0 para Ethernet, en1 para Wi-Fi)</li>
          <li>Procure por &quot;ether&quot; seguido do endereço MAC</li>
          <li>O MAC aparecerá no formato: <span className="font-mono text-primary">00:1a:2b:3c:4d:5e</span></li>
        </ol>
      </div>
    </div>
  );
}

