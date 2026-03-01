import { useState, useRef, useEffect } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { currentLocale } from '../store/languageStore';

export default function TalosOSSimulator() {
    const [logs, setLogs] = useState<string[]>([]);
    const [nodes, setNodes] = useState([
        { id: 'cp-1', name: 'control-plane-1', status: 'ready', locked: true },
        { id: 'wk-1', name: 'worker-1', status: 'ready', locked: true },
        { id: 'wk-2', name: 'worker-2', status: 'ready', locked: true },
    ]);
    const [activeAction, setActiveAction] = useState<string | null>(null);

    const locale = useStore(currentLocale) as 'en' | 'es';
    const logsRef = useRef<HTMLDivElement>(null);

    const t = locale === 'en' ? {
        title: 'Immutable OS: Talos Linux API',
        ssh: 'Attempt SSH Login',
        apply: 'Apply MachineConfig',
        upgrade: 'Trigger OS Upgrade',
        logSshFail: 'Connection refused. Port 22/tcp closed. (Talos Immutable Design)',
        logApply: 'Pushing declarative YAML payload via gRPC...',
        logUpgrade: 'Initiating rolling reboot and API-driven kernel update...',
        ready: 'API Ready',
        locked: 'Immutable / Locked',
        upgrading: 'Rebooting / Upgrading OS',
        waiting: 'Awaiting talosctl commands...'
    } : {
        title: 'SO Inmutable: API de Talos Linux',
        ssh: 'Intentar Login SSH',
        apply: 'Aplicar MachineConfig',
        upgrade: 'Trigger OS Upgrade',
        logSshFail: 'Conexión rechazada. Puerto 22 cerrado por diseño inmutable.',
        logApply: 'Enviando configuración declarativa YAML vía gRPC...',
        logUpgrade: 'Iniciando reinicio en cascada y actualización de kernel por API...',
        ready: 'API Lista',
        locked: 'Inmutable / Bloqueado',
        upgrading: 'Reiniciando / Actualizando',
        waiting: 'Esperando comandos talosctl...'
    };

    useEffect(() => { if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight; }, [logs]);

    const addLog = (msg: string, isError = false) => {
        const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLogs(prev => [...prev.slice(-15), `<span style="color:${isError ? '#ef4444' : '#60a5fa'}">[${time}]</span> ${msg}`]);
    };

    const attemptSSH = () => {
        if (activeAction) return;
        setActiveAction('ssh');
        addLog(`> ssh root@talos-worker-1`);
        setTimeout(() => {
            addLog(`<span style="color:#ef4444">${t.logSshFail}</span>`, true);
            setActiveAction(null);
        }, 600);
    };

    const applyConfig = () => {
        if (activeAction) return;
        setActiveAction('apply');
        addLog(`> talosctl apply-config --nodes worker-1,worker-2 -f patch.yaml`);
        setTimeout(() => {
            addLog(`[gRPC] ${t.logApply}`);
            setNodes(prev => prev.map(n => n.id.startsWith('wk') ? { ...n, locked: false } : n));

            setTimeout(() => {
                addLog(`<span style="color:#34d399">✓ Successfully applied new config. Filesystem remounted Read-Only.</span>`);
                setNodes(prev => prev.map(n => ({ ...n, locked: true })));
                setActiveAction(null);
            }, 1500);
        }, 500);
    };

    const triggerUpgrade = () => {
        if (activeAction) return;
        setActiveAction('upgrade');
        addLog(`> talosctl upgrade --nodes worker-2 --image factory.talos.dev/...`);
        setTimeout(() => {
            addLog(`[API] ${t.logUpgrade}`);
            setNodes(prev => prev.map(n => n.id === 'wk-2' ? { ...n, status: 'upgrading', locked: false } : n));

            setTimeout(() => {
                addLog(`<span style="color:#fbbf24">[WARN] Node worker-2 offline for reboot.</span>`);

                setTimeout(() => {
                    addLog(`<span style="color:#34d399">✓ Node worker-2 joined cluster with new Kernel context.</span>`);
                    setNodes(prev => prev.map(n => n.id === 'wk-2' ? { ...n, status: 'ready', locked: true } : n));
                    setActiveAction(null);
                }, 2000);
            }, 1500);
        }, 800);
    };

    return (
        <div className="talos-container">
            <div className="talos-header">
                <div className="title">🛡️ {t.title}</div>
            </div>

            <div className="visual-field">
                <div className="nodes-container">
                    {nodes.map(n => (
                        <div key={n.id} className={`os-node ${n.status === 'upgrading' ? 'upgrading' : ''}`}>
                            <div className="node-icon">
                                {n.status === 'upgrading' ? '⏳' : '🖥️'}
                            </div>
                            <div className="node-info">
                                <div className="node-name">{n.name}</div>
                                <div className={`node-state ${n.status}`}>{n.status === 'ready' ? t.ready : t.upgrading}</div>
                            </div>
                            <div className={`node-lock ${n.locked ? 'locked' : 'unlocked'}`}>
                                {n.locked ? '🔒' : '🔓'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="controls">
                <button className="btn ssh" onClick={attemptSSH} disabled={!!activeAction}>💣 {t.ssh}</button>
                <button className="btn apply" onClick={applyConfig} disabled={!!activeAction}>📄 {t.apply}</button>
                <button className="btn upgrade" onClick={triggerUpgrade} disabled={!!activeAction}>🔄 {t.upgrade}</button>
            </div>

            <div className="terminal">
                <div className="terminal-header">
                    <div className="dots"><span /><span /><span /></div>
                    <span>&gt;_ talosctl API Log</span>
                </div>
                <div className="terminal-body" ref={logsRef}>
                    {logs.length === 0 ? <span className="dim">{t.waiting}</span> :
                        logs.map((log, i) => <div key={i} dangerouslySetInnerHTML={{ __html: log }} />)}
                </div>
            </div>

            <style>{`
        .talos-container {
          background: linear-gradient(145deg, #0d1117 0%, #0a0c10 100%);
          border-radius: 1rem; padding: 1.5rem; border: 1px solid rgba(255,255,255,0.1);
          font-family: 'Inter', system-ui, sans-serif; display: flex; flex-direction: column; gap: 1.5rem;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4); min-width: 450px;
        }
        .talos-header .title { color: #facc15; font-weight: 700; font-size: 1.1rem; text-shadow: 0 0 10px rgba(250,204,21,0.3); }
        
        .visual-field { background: #010409; border-radius: 0.75rem; border: 1px solid #21262d; padding: 1.5rem; position: relative; overflow: hidden; box-shadow: inset 0 0 30px rgba(0,0,0,0.5); }
        
        .nodes-container { display: flex; gap: 1rem; justify-content: space-around; }
        
        .os-node { background: rgba(33,38,45,0.6); border: 1px solid #30363d; border-radius: 0.75rem; padding: 1rem; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; flex: 1; position: relative; transition: all 0.3s; }
        .os-node.upgrading { border-color: #fbbf24; animation: pulse-warn 1s infinite alternate; }
        @keyframes pulse-warn { from { box-shadow: 0 0 0px transparent; } to { box-shadow: 0 0 15px rgba(251,191,36,0.2); } }
        
        .node-icon { font-size: 2.5rem; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5)); }
        .node-info { text-align: center; }
        .node-name { font-weight: 600; font-size: 0.8rem; color: #c9d1d9; font-family: monospace; }
        .node-state { font-size: 0.65rem; font-weight: 700; margin-top: 0.25rem; padding: 0.2rem 0.5rem; border-radius: 1rem; }
        .node-state.ready { color: #34d399; background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.3); }
        .node-state.upgrading { color: #fbbf24; background: rgba(251,191,36,0.1); border: 1px solid rgba(251,191,36,0.3); }
        
        .node-lock { position: absolute; top: -10px; right: -10px; background: #0d1117; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; border: 1px solid #30363d; z-index: 5; transition: all 0.3s; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
        .node-lock.locked { border-color: #3b82f6; box-shadow: 0 0 15px rgba(59,130,246,0.4); text-shadow: 0 0 5px #3b82f6; }
        .node-lock.unlocked { border-color: #ef4444; box-shadow: 0 0 15px rgba(239,68,68,0.4); text-shadow: 0 0 5px #ef4444; transform: scale(1.1); }

        .controls { display: flex; gap: 0.75rem; }
        .btn { flex: 1; padding: 0.8rem; border-radius: 0.5rem; border: none; font-weight: 600; cursor: pointer; transition: all 0.2s; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; gap: 0.4rem; color: #c9d1d9; }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn:not(:disabled):hover { transform: translateY(-2px); }
        .btn.ssh { background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.4); color: #f87171; }
        .btn.ssh:not(:disabled):hover { background: rgba(239,68,68,0.3); box-shadow: 0 0 15px rgba(239,68,68,0.2); }
        .btn.apply { background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.4); color: #60a5fa; }
        .btn.apply:not(:disabled):hover { background: rgba(59,130,246,0.3); box-shadow: 0 0 15px rgba(59,130,246,0.2); }
        .btn.upgrade { background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.4); color: #fbbf24; }
        .btn.upgrade:not(:disabled):hover { background: rgba(245,158,11,0.3); box-shadow: 0 0 15px rgba(245,158,11,0.2); }

        .terminal { background: #010409; border-radius: 0.5rem; border: 1px solid #30363d; overflow: hidden; display: flex; flex-direction: column; }
        .terminal-header { background: #161b22; padding: 0.5rem 1rem; display: flex; align-items: center; gap: 1rem; font-family: monospace; font-size: 0.7rem; color: #8b949e; border-bottom: 1px solid #30363d; }
        .dots { display: flex; gap: 0.3rem; }
        .dots span { width: 8px; height: 8px; border-radius: 50%; }
        .dots span:nth-child(1) { background: #ff5f56; }
        .dots span:nth-child(2) { background: #ffbd2e; }
        .dots span:nth-child(3) { background: #27c93f; }
        .terminal-body { padding: 1rem; height: 120px; overflow-y: auto; font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: #c9d1d9; display: flex; flex-direction: column; gap: 0.4rem; }
        .dim { color: #4b5563; font-style: italic; }
        .terminal-body::-webkit-scrollbar { width: 6px; }
        .terminal-body::-webkit-scrollbar-thumb { background: #30363d; border-radius: 3px; }
      `}</style>
        </div>
    );
}
