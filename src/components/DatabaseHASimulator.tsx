import { useState, useRef, useEffect } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { currentLocale } from '../store/languageStore';

export default function DatabaseHASimulator() {
    const [state, setState] = useState<'healthy' | 'failing' | 'electing' | 'promoting' | 'recovered'>('healthy');
    const [logs, setLogs] = useState<string[]>([]);
    const locale = useStore(currentLocale) as 'en' | 'es';

    const t = locale === 'en' ? {
        title: 'CloudNativePG HA architecture',
        triggerFail: '⚡ Trigger Node Failure',
        simulating: 'Automated Recovery in Progress...',
        logs: 'Postgres Operator Logs',
        primary: 'Primary (R/W)',
        syncRep: 'Sync Replica',
        asyncRep: 'Async Replica',
        pgbouncer: 'PgBouncer Pool'
    } : {
        title: 'Arquitectura HA CloudNativePG',
        triggerFail: '⚡ Provocar Caída de Nodo',
        simulating: 'Recuperación Automática en Progreso...',
        logs: 'Logs Operador Postgres',
        primary: 'Primario (L/E)',
        syncRep: 'Réplica Síncrona',
        asyncRep: 'Réplica Asíncrona',
        pgbouncer: 'Pool PgBouncer'
    };

    const logsRef = useRef<HTMLDivElement>(null);
    useEffect(() => { if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight; }, [logs]);

    const addLog = (msg: string) => {
        const time = new Date().toISOString().split('T')[1].slice(0, 12);
        setLogs(p => [...p, `[${time}] ${msg}`]);
    };

    useEffect(() => {
        if (logs.length === 0) {
            addLog('INFO: Cluster initialized. Nodes: 3. Architecture: CloudNativePG.');
            addLog('INFO: Synchronous replication active on homelab-db-2.');
        }
    }, []);

    const triggerFailure = () => {
        if (state !== 'healthy') return;
        setState('failing');
        addLog('FATAL: Node homelab-db-1 crashed unexpectedly. Connection refused.');

        setTimeout(() => {
            setState('electing');
            addLog('WARN: Liveness probe failed for homelab-db-1.');
            addLog('INFO: Initiating automated failover protocol via Raft...');
        }, 2000);

        setTimeout(() => {
            setState('promoting');
            addLog('INFO: Node homelab-db-2 has most recent WAL.');
            addLog('INFO: Promoting homelab-db-2 to Primary.');
            addLog('INFO: Reconfiguring PgBouncer routing.');
        }, 4500);

        setTimeout(() => {
            setState('recovered');
            addLog('SUCCESS: Failover complete. homelab-db-2 is now Primary.');
            addLog('INFO: Fencing old primary. Provisioning new standby instance...');
        }, 7000);

        setTimeout(() => {
            setState('healthy');
            addLog('INFO: Cluster restored to full High Availability.');
        }, 10000);
    };

    return (
        <div className="db-simulator-container">
            <div className="db-header">
                <div className="title">🐘 {t.title}</div>
                <div className="postgres-version">PostgreSQL 16.2 | CNPG 1.22</div>
            </div>

            <div className="db-visual-area">
                {/* PgBouncer Layer */}
                <div className="pgbouncer-layer">
                    <div className="icon">🛡️</div>
                    <div>{t.pgbouncer} <span className="query-badge">QPS: {state === 'healthy' ? '1,420' : state === 'recovered' ? '1,100' : '0'}</span></div>
                </div>

                {/* Database Nodes Grid */}
                <div className="nodes-grid">
                    {/* Node 1: Original Primary */}
                    <div className={`db-node ${state === 'failing' ? 'crashing' : state === 'electing' || state === 'promoting' ? 'dead' : state === 'recovered' ? 'recovering' : 'primary'}`}>
                        <div className="db-cylinder">
                            <div className="db-top"></div>
                            <div className="db-body">
                                <span className="node-icon">{state === 'healthy' ? '👑' : state === 'recovered' ? '🔄' : '❌'}</span>
                            </div>
                        </div>
                        <div className="node-label">
                            <div className="name">homelab-db-1</div>
                            <div className="role">
                                {state === 'healthy' ? t.primary
                                    : state === 'recovered' ? t.asyncRep
                                        : 'Node Offline'}
                            </div>
                        </div>
                    </div>

                    {/* Connection Lines rendered minimally for aesthetics */}
                    <div className="replication-lines">
                        {state === 'healthy' && <div className="flow-primary-to-sync"></div>}
                        {state === 'recovered' && <div className="flow-new-primary"></div>}
                    </div>

                    {/* Node 2: Sync Replica -> Becomes Primary */}
                    <div className={`db-node ${state === 'healthy' || state === 'failing' ? 'sync' : state === 'electing' || state === 'promoting' ? 'promoting' : 'primary'}`}>
                        <div className="db-cylinder">
                            <div className="db-top"></div>
                            <div className="db-body">
                                <span className="node-icon">{state === 'healthy' || state === 'failing' ? '🛡️' : state === 'electing' ? '⏱️' : '👑'}</span>
                            </div>
                        </div>
                        <div className="node-label">
                            <div className="name">homelab-db-2</div>
                            <div className="role">
                                {state === 'healthy' || state === 'failing' ? t.syncRep : state === 'electing' ? 'Leader Election' : t.primary}
                            </div>
                        </div>
                    </div>

                    {/* Node 3: Async Replica */}
                    <div className={`db-node async`}>
                        <div className="db-cylinder">
                            <div className="db-top"></div>
                            <div className="db-body">
                                <span className="node-icon">💾</span>
                            </div>
                        </div>
                        <div className="node-label">
                            <div className="name">homelab-db-3</div>
                            <div className="role">{t.asyncRep}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="controls">
                <button className="btn trigger" onClick={triggerFailure} disabled={state !== 'healthy'}>
                    {state !== 'healthy' ? t.simulating : t.triggerFail}
                </button>
            </div>

            <div className="terminal">
                <div className="terminal-header">
                    <div className="dots"><span /><span /><span /></div>
                    <span>&gt;_ {t.logs}</span>
                </div>
                <div className="terminal-body" ref={logsRef}>
                    {logs.map((l, i) => (
                        <div key={i} style={{ color: l.includes('FATAL') || l.includes('CRITICAL') ? '#f87171' : l.includes('SUCCESS') ? '#34d399' : l.includes('WARN') ? '#fbbf24' : '#c9d1d9' }}>
                            {l}
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
        .db-simulator-container {
          background: linear-gradient(145deg, #0d1117 0%, #0a0c10 100%);
          border-radius: 1rem; padding: 1.5rem; border: 1px solid rgba(255,255,255,0.1);
          font-family: 'Inter', system-ui, sans-serif; display: flex; flex-direction: column; gap: 1.5rem;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4); min-width: 450px;
        }
        .db-header { display: flex; justify-content: space-between; align-items: center; }
        .db-header .title { color: #58a6ff; font-weight: 700; font-size: 1.1rem; text-shadow: 0 0 10px rgba(88,166,255,0.3); }
        .postgres-version { background: rgba(59,130,246,0.1); padding: 0.2rem 0.6rem; border-radius: 1rem; font-size: 0.65rem; color: #60a5fa; border: 1px solid rgba(59,130,246,0.3); font-family: monospace; }
        
        .db-visual-area { background: #010409; border-radius: 0.75rem; border: 1px solid #21262d; padding: 1.5rem; display: flex; flex-direction: column; gap: 2rem; position: relative; box-shadow: inset 0 0 20px rgba(0,0,0,0.5); }
        
        .pgbouncer-layer { background: rgba(139,92,246,0.1); border: 1px dashed #8b5cf6; border-radius: 0.5rem; padding: 0.8rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; color: #c4b5fd; font-weight: 600; font-size: 0.8rem; box-shadow: 0 0 20px rgba(139,92,246,0.1); }
        .query-badge { margin-left: 1rem; background: #8b5cf6; color: white; padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.6rem; font-family: monospace; }

        .nodes-grid { display: flex; justify-content: space-between; position: relative; padding: 0 1rem; }
        
        .db-node { display: flex; flex-direction: column; align-items: center; gap: 0.8rem; width: 100px; z-index: 2; transition: all 0.5s; }
        .db-cylinder { position: relative; width: 60px; height: 70px; }
        .db-top { position: absolute; top: 0; width: 100%; height: 20px; border-radius: 50%; background: #21262d; border: 1px solid #30363d; z-index: 2; }
        .db-body { position: absolute; top: 10px; width: 100%; height: 60px; border-radius: 0 0 50% 50%; transition: all 0.5s; display: flex; align-items: center; justify-content: center; border: 1px solid; }
        .node-icon { z-index: 3; font-size: 1.2rem; transform: translateY(5px); }
        
        /* Node states styling */
        .primary .db-body { background: linear-gradient(180deg, rgba(59,130,246,0.2), rgba(59,130,246,0.4)); border-color: #3b82f6; box-shadow: 0 10px 20px rgba(59,130,246,0.2); }
        .primary .db-top { background: #1e3a8a; border-color: #3b82f6; }
        
        .sync .db-body { background: linear-gradient(180deg, rgba(16,185,129,0.1), rgba(16,185,129,0.3)); border-color: #10b981; }
        .sync .db-top { background: #064e3b; border-color: #10b981; }
        
        .async .db-body { background: linear-gradient(180deg, rgba(107,114,128,0.1), rgba(107,114,128,0.3)); border-color: #6b7280; }
        .async .db-top { background: #1f2937; border-color: #6b7280; }
        
        .crashing .db-body { background: linear-gradient(180deg, rgba(239,68,68,0.4), rgba(239,68,68,0.8)); border-color: #ef4444; animation: shake 0.5s infinite; }
        .crashing .db-top { background: #7f1d1d; border-color: #ef4444; }
        
        .dead { opacity: 0.3; filter: grayscale(1); }
        
        .promoting .db-body { background: linear-gradient(180deg, rgba(245,158,11,0.2), rgba(245,158,11,0.5)); border-color: #f59e0b; animation: pulsePromote 1s infinite alternate; }
        .promoting .db-top { background: #78350f; border-color: #f59e0b; }
        
        .recovering .db-body { background: linear-gradient(180deg, rgba(107,114,128,0.1), rgba(107,114,128,0.3)); border-color: #4b5563; border-style: dashed; }
        .recovering .db-top { background: #1f2937; }

        @keyframes shake { 0% { transform: translateX(0); } 25% { transform: translateX(3px); } 50% { transform: translateX(-3px); } 75% { transform: translateX(3px); } 100% { transform: translateX(0); } }
        @keyframes pulsePromote { from { box-shadow: 0 0 10px rgba(245,158,11,0.2); } to { box-shadow: 0 0 30px rgba(245,158,11,0.6); } }

        .node-label { text-align: center; }
        .node-label .name { font-size: 0.65rem; color: #c9d1d9; font-family: monospace; font-weight: bold; background: rgba(33,38,45,0.8); padding: 0.2rem 0.4rem; border-radius: 0.2rem; }
        .node-label .role { font-size: 0.6rem; color: #8b949e; margin-top: 0.3rem; }

        .replication-lines { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
        .flow-primary-to-sync { position: absolute; left: 60px; top: 35px; width: 120px; height: 3px; background: repeating-linear-gradient(90deg, #10b981, #10b981 5px, transparent 5px, transparent 10px); animation: march 1s linear infinite; }
        .flow-new-primary { position: absolute; right: 60px; top: 35px; width: 120px; height: 3px; background: repeating-linear-gradient(270deg, #3b82f6, #3b82f6 5px, transparent 5px, transparent 10px); animation: marchRev 1s linear infinite; }
        
        @keyframes march { from { background-position: 0 0; } to { background-position: 20px 0; } }
        @keyframes marchRev { from { background-position: 0 0; } to { background-position: -20px 0; } }

        .controls { display: flex; gap: 0.75rem; }
        .btn { flex: 1; padding: 0.8rem; border-radius: 0.5rem; border: none; font-weight: 600; cursor: pointer; transition: all 0.2s; font-size: 0.8rem; }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn.trigger { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.4); }
        .btn.trigger:not(:disabled):hover { background: rgba(239,68,68,0.3); box-shadow: 0 0 20px rgba(239,68,68,0.3); transform: translateY(-2px); }

        .terminal { background: #010409; border-radius: 0.5rem; border: 1px solid #30363d; overflow: hidden; display: flex; flex-direction: column; }
        .terminal-header { background: #161b22; padding: 0.5rem 1rem; display: flex; align-items: center; gap: 1rem; font-family: monospace; font-size: 0.7rem; color: #8b949e; border-bottom: 1px solid #30363d; }
        .dots { display: flex; gap: 0.3rem; }
        .dots span { width: 8px; height: 8px; border-radius: 50%; }
        .dots span:nth-child(1) { background: #ff5f56; }
        .dots span:nth-child(2) { background: #ffbd2e; }
        .dots span:nth-child(3) { background: #27c93f; }
        .terminal-body { padding: 1rem; height: 120px; overflow-y: auto; font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; display: flex; flex-direction: column; gap: 0.3rem; }
        .terminal-body::-webkit-scrollbar { width: 6px; }
        .terminal-body::-webkit-scrollbar-thumb { background: #30363d; border-radius: 3px; }
      `}</style>
        </div>
    );
}
