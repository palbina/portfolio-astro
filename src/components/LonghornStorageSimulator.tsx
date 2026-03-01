import { useState, useRef, useEffect } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { currentLocale } from '../store/languageStore';

type Block = { id: number; node: number; active: boolean; };

export default function LonghornStorageSimulator() {
    const [logs, setLogs] = useState<string[]>([]);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [nodes, setNodes] = useState([true, true, true]); // true = healthy
    const [activeAction, setActiveAction] = useState<string | null>(null);
    const replicaRef = useRef(0);
    const logsRef = useRef<HTMLDivElement>(null);

    const locale = useStore(currentLocale) as 'en' | 'es';

    const t = locale === 'en' ? {
        title: 'Distributed Storage: Longhorn Replication',
        write: 'Write Data Block',
        kill: 'Simulate Node Crash',
        rebuild: 'Trigger Auto-Rebuild',
        logWrite: 'Writing 4KB block to PVC...',
        logSync: 'Synchronous replication to 3 nodes... OK',
        logCrash: '[CRIT] Node 2 Hardware Failure Detected! Replica lost.',
        logDegraded: 'Volume health: DEGRADED. Serving from Nodes 1 & 3.',
        logRebuild: 'Provisioning replacement PVC replica on Node 2...',
        logHealed: 'Volume health: HEALTHY. All replicas synchronized.',
        waiting: 'Awaiting I/O operations...'
    } : {
        title: 'Almacenamiento Distr: Réplicas Longhorn',
        write: 'Escribir Bloque',
        kill: 'Simular Caída de Nodo',
        rebuild: 'Ejecutar Reconstrucción',
        logWrite: 'Escribiendo bloque 4KB en PVC...',
        logSync: 'Replicación sincrónica confirmada en 3 nodos... OK',
        logCrash: '[CRIT] Falla de Hardware en Nodo 2! Réplica aislada.',
        logDegraded: 'Salud de Volumen: DEGRADADO. Sirviendo desde Nodos 1 y 3.',
        logRebuild: 'Provisionando nueva réplica de reemplazo en Nodo 2...',
        logHealed: 'Salud de Volumen: SANO. Todas las réplicas resincronizadas.',
        waiting: 'Esperando operaciones I/O...'
    };

    useEffect(() => { if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight; }, [logs]);

    const addLog = (msg: string, color = '#c9d1d9') => {
        const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLogs(prev => [...prev.slice(-15), `<span style="color:#6b7280">[${time}]</span> <span style="color:${color}">${msg}</span>`]);
    };

    const writeData = () => {
        if (activeAction) return;
        setActiveAction('write');
        addLog(t.logWrite, '#60a5fa');

        setTimeout(() => {
            replicaRef.current++;
            const bId = replicaRef.current;
            setBlocks(prev => [
                ...prev,
                { id: bId, node: 0, active: nodes[0] },
                { id: bId, node: 1, active: nodes[1] },
                { id: bId, node: 2, active: nodes[2] }
            ]);
            addLog(t.logSync, '#34d399');
            setActiveAction(null);
        }, 600);
    };

    const killNode = () => {
        if (activeAction || !nodes[1]) return;
        setActiveAction('kill');
        addLog(t.logCrash, '#ef4444');

        setNodes([true, false, true]);
        setBlocks(prev => prev.map(b => b.node === 1 ? { ...b, active: false } : b));

        setTimeout(() => {
            addLog(t.logDegraded, '#fbbf24');
            setActiveAction(null);
        }, 500);
    };

    const rebuildNode = () => {
        if (activeAction || nodes[1]) return;
        setActiveAction('rebuild');
        addLog(t.logRebuild, '#a78bfa');

        setTimeout(() => {
            setNodes([true, true, true]);

            // Animate blocks filling in sequentially
            const offlineBlocks = blocks.filter(b => b.node === 1);
            offlineBlocks.forEach((b, idx) => {
                setTimeout(() => {
                    setBlocks(prev => prev.map(pb => (pb.node === 1 && pb.id === b.id) ? { ...pb, active: true } : pb));
                }, 300 + (idx * 200));
            });

            setTimeout(() => {
                addLog(t.logHealed, '#34d399');
                setActiveAction(null);
            }, 300 + (offlineBlocks.length * 200) + 200);

        }, 600);
    };

    return (
        <div className="longhorn-container">
            <div className="longhorn-header">
                <div className="title">💾 {t.title}</div>
            </div>

            <div className="storage-grid">
                {nodes.map((isHealthy, idx) => (
                    <div key={idx} className={`storage-node ${!isHealthy ? 'offline' : ''}`}>
                        <div className="node-title">NVMe Node {idx + 1}</div>
                        <div className="node-disk">
                            {blocks.filter(b => b.node === idx).map((b, i) => (
                                <div key={`${b.id}-${idx}-${b.active}`} className={`data-block ${!b.active ? 'corrupted' : 'healthy'}`} style={{ animationDelay: `${i * 0.05}s` }} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="controls">
                <button className="btn write" onClick={writeData} disabled={!!activeAction}>📝 {t.write}</button>
                <button className="btn kill" onClick={killNode} disabled={!!activeAction || !nodes[1]}>🔥 {t.kill}</button>
                <button className="btn rebuild" onClick={rebuildNode} disabled={!!activeAction || nodes[1]}>🩹 {t.rebuild}</button>
            </div>

            <div className="terminal">
                <div className="terminal-header">
                    <div className="dots"><span /><span /><span /></div>
                    <span>&gt;_ Longhorn Controller Log</span>
                </div>
                <div className="terminal-body" ref={logsRef}>
                    {logs.length === 0 ? <span className="dim">{t.waiting}</span> :
                        logs.map((log, i) => <div key={i} dangerouslySetInnerHTML={{ __html: log }} />)}
                </div>
            </div>

            <style>{`
        .longhorn-container {
          background: linear-gradient(145deg, #0d1117 0%, #0a0c10 100%);
          border-radius: 1rem; padding: 1.5rem; border: 1px solid rgba(255,255,255,0.1);
          font-family: 'Inter', system-ui, sans-serif; display: flex; flex-direction: column; gap: 1.5rem;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4); min-width: 450px;
        }
        .longhorn-header .title { color: #a78bfa; font-weight: 700; font-size: 1.1rem; text-shadow: 0 0 10px rgba(167,139,250,0.3); }
        
        .storage-grid { background: #010409; border-radius: 0.75rem; border: 1px solid #21262d; padding: 1.5rem; display: flex; gap: 1rem; box-shadow: inset 0 0 30px rgba(0,0,0,0.5); }
        
        .storage-node { flex: 1; background: #0d1117; border: 1px solid #30363d; border-radius: 0.5rem; display: flex; flex-direction: column; overflow: hidden; transition: all 0.3s; }
        .storage-node.offline { border-color: #ef4444; opacity: 0.6; filter: grayscale(1); transform: translateY(5px); }
        .storage-node.offline .node-title { background: #ef4444; color: white; }

        .node-title { background: #21262d; color: #c9d1d9; font-size: 0.7rem; font-weight: 600; text-align: center; padding: 0.4rem; font-family: monospace; transition: all 0.3s; }
        .node-disk { padding: 0.5rem; display: flex; flex-wrap: wrap; gap: 4px; height: 120px; align-content: flex-start; overflow-y: auto; }
        .node-disk::-webkit-scrollbar { width: 4px; }
        .node-disk::-webkit-scrollbar-thumb { background: #30363d; }

        .data-block { width: calc(33.33% - 3px); height: 15px; border-radius: 2px; animation: popIn 0.3s ease-out backwards; }
        .data-block.healthy { background: #34d399; box-shadow: 0 0 5px rgba(52,211,153,0.4); }
        .data-block.corrupted { background: #30363d; animation: none; }
        
        @keyframes popIn { 0% { opacity: 0; transform: scale(0.5); } 100% { opacity: 1; transform: scale(1); } }

        .controls { display: flex; gap: 0.75rem; }
        .btn { flex: 1; padding: 0.8rem; border-radius: 0.5rem; border: none; font-weight: 600; cursor: pointer; transition: all 0.2s; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; gap: 0.4rem; color: #c9d1d9; }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn:not(:disabled):hover { transform: translateY(-2px); }
        .btn.write { background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.4); color: #60a5fa; }
        .btn.write:not(:disabled):hover { background: rgba(59,130,246,0.3); box-shadow: 0 0 15px rgba(59,130,246,0.2); }
        .btn.kill { background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.4); color: #f87171; }
        .btn.kill:not(:disabled):hover { background: rgba(239,68,68,0.3); box-shadow: 0 0 15px rgba(239,68,68,0.2); }
        .btn.rebuild { background: rgba(167,139,250,0.15); border: 1px solid rgba(167,139,250,0.4); color: #c084fc; }
        .btn.rebuild:not(:disabled):hover { background: rgba(167,139,250,0.3); box-shadow: 0 0 15px rgba(167,139,250,0.2); }

        .terminal { background: #010409; border-radius: 0.5rem; border: 1px solid #30363d; overflow: hidden; display: flex; flex-direction: column; }
        .terminal-header { background: #161b22; padding: 0.5rem 1rem; display: flex; align-items: center; gap: 1rem; font-family: monospace; font-size: 0.7rem; color: #8b949e; border-bottom: 1px solid #30363d; }
        .dots { display: flex; gap: 0.3rem; }
        .dots span { width: 8px; height: 8px; border-radius: 50%; }
        .dots span:nth-child(1) { background: #ff5f56; }
        .dots span:nth-child(2) { background: #ffbd2e; }
        .dots span:nth-child(3) { background: #27c93f; }
        .terminal-body { padding: 1rem; height: 120px; overflow-y: auto; font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; display: flex; flex-direction: column; gap: 0.4rem; }
        .dim { color: #4b5563; font-style: italic; }
        .terminal-body::-webkit-scrollbar { width: 6px; }
        .terminal-body::-webkit-scrollbar-thumb { background: #30363d; border-radius: 3px; }
      `}</style>
        </div>
    );
}
