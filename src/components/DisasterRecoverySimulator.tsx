import { useState, useRef, useEffect } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { currentLocale } from '../store/languageStore';

export default function DisasterRecoverySimulator() {
    const [status, setStatus] = useState<'healthy' | 'disaster' | 'restoring_crd' | 'restoring_vol' | 'restoring_pods'>('healthy');
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);
    const locale = useStore(currentLocale) as 'en' | 'es';

    const t = locale === 'en' ? {
        title: 'Disaster Recovery: Velero & Longhorn',
        nuke: '☢️ Simulate Catastrophic Failure',
        restore: '🔄 Trigger Velero Restore',
        live: 'Live Cluster (K8s)',
        backup: 'S3 Off-site Backup',
        pods: 'App Pods',
        pvc: 'Longhorn PVCs',
        status: 'System Status',
        logs: 'Velero Operator Logs'
    } : {
        title: 'Recuperación ante Desastres',
        nuke: '☢️ Simular Fallo Catastrófico',
        restore: '🔄 Iniciar Restauración',
        live: 'Cluster Activo (K8s)',
        backup: 'Backup S3 Remoto',
        pods: 'Pods de Apps',
        pvc: 'PVCs Longhorn',
        status: 'Estado del Sistema',
        logs: 'Logs Operador Velero'
    };

    const logsRef = useRef<HTMLDivElement>(null);
    useEffect(() => { if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight; }, [logs]);

    const addLog = (msg: string) => {
        const time = new Date().toISOString().split('T')[1].slice(0, 12);
        setLogs(p => [...p, `[${time}] ${msg}`]);
    };

    const simulateDisaster = () => {
        if (status !== 'healthy') return;
        setStatus('disaster');
        setLogs([]);
        addLog('CRITICAL: Massive power surge detected at datacenter.');
        addLog('CRITICAL: All nodes offline. Quorum lost. Volumes completely unrecoverable.');
        addLog('FATAL: Cluster state wiped.');
    };

    const triggerRestore = () => {
        if (status !== 'disaster') return;
        setStatus('restoring_crd');
        setProgress(0);
        addLog('INFO: Validating backup repository: s3://homelab-dr');
        addLog('INFO: Found restic snapshot b3a8v91z (Age: 4h)');

        // Animate restore process
        let currentPhase = 'crd';
        let currentProg = 0;

        const it = setInterval(() => {
            currentProg += 2;
            setProgress(currentProg);

            if (currentProg === 30 && currentPhase === 'crd') {
                currentPhase = 'vol';
                setStatus('restoring_vol');
                addLog('INFO: CRDs and Namespaces restored successfully.');
                addLog('INFO: Instructing Longhorn to provision volumes from S3 snapshots...');
            }

            if (currentProg === 70 && currentPhase === 'vol') {
                currentPhase = 'pods';
                setStatus('restoring_pods');
                addLog('INFO: Data volumes attached and healthy.');
                addLog('INFO: Spawning Deployments, StatefulSets, and Pods...');
            }

            if (currentProg >= 100) {
                clearInterval(it);
                setStatus('healthy');
                addLog('SUCCESS: Velero Restore completed. All services Operational. RTO: 4m 12s.');
            }
        }, 100);
    };

    return (
        <div className="dr-simulator-container">
            <div className="dr-header">
                <div className="title">💾 {t.title}</div>
                <div className={`status-badge ${status}`}>
                    {status === 'healthy' ? '🟢 NORMAL' : status === 'disaster' ? '🔴 OFFLINE' : '🟡 RECOVERING'}
                </div>
            </div>

            <div className="dr-visual-grid">
                {/* Left Side: Live Cluster */}
                <div className={`dr-box live ${status === 'disaster' ? 'failing' : ''}`}>
                    <div className="box-title">{t.live}</div>
                    <div className="k8s-objects">
                        <div className={`k8s-item ${(status === 'healthy' || status === 'restoring_pods') ? 'active' : 'dead'}`}>
                            <span className="icon">📦</span> {t.pods}
                            <div className="indicator" />
                        </div>
                        <div className={`k8s-item ${(status === 'healthy' || status === 'restoring_vol' || status === 'restoring_pods') ? 'active' : 'dead'}`}>
                            <span className="icon">💽</span> {t.pvc}
                            <div className="indicator" />
                        </div>
                    </div>
                    {status === 'disaster' && <div className="overlay-red">DATA LOST</div>}
                </div>

                {/* Center: Sync/Restore animation */}
                <div className="dr-sync">
                    {status === 'healthy' && <div className="arrow flowing-right">Backup ➔</div>}
                    {status.includes('restoring') && <div className="arrow flowing-left">Restore ⬅</div>}
                    {status === 'disaster' && <div className="arrow dead">✖ Connection Lost</div>}
                </div>

                {/* Right Side: S3 */}
                <div className="dr-box s3">
                    <div className="box-title">{t.backup}</div>
                    <div className="s3-bucket">
                        <div className="bucket-icon">☁️ S3</div>
                        <div className={`snapshot ${status === 'healthy' ? 'pulse-slow' : 'bright'}`}>
                            Snapshot: {new Date().toISOString().split('T')[0]}
                            <br />Size: 1.4 TB
                            <br />Status: Verified
                        </div>
                    </div>
                </div>
            </div>

            <div className="progress-container">
                <div className="progress-bar-bg">
                    <div className={`progress-bar-fill ${status === 'healthy' && progress === 100 ? 'done' : ''}`} style={{ width: `${progress}%` }} />
                </div>
            </div>

            <div className="controls">
                <button className="btn nuke" onClick={simulateDisaster} disabled={status !== 'healthy'}>{t.nuke}</button>
                <button className="btn restore" onClick={triggerRestore} disabled={status !== 'disaster'}>{t.restore}</button>
            </div>

            <div className="terminal">
                <div className="terminal-header">
                    <div className="dots"><span /><span /><span /></div>
                    <span>&gt;_ {t.logs}</span>
                </div>
                <div className="terminal-body" ref={logsRef}>
                    {logs.length === 0 ? <span className="dim">System operating normally. Velero sync schedule: Every 4h.</span> :
                        logs.map((l, i) => (
                            <div key={i} style={{ color: l.includes('CRITICAL') || l.includes('FATAL') ? '#f87171' : l.includes('SUCCESS') ? '#34d399' : '#c9d1d9' }}>
                                {l}
                            </div>
                        ))}
                </div>
            </div>

            <style>{`
        .dr-simulator-container {
          background: linear-gradient(145deg, #0d1117 0%, #0a0c10 100%);
          border-radius: 1rem; padding: 1.5rem; border: 1px solid rgba(255,255,255,0.1);
          font-family: 'Inter', system-ui, sans-serif; display: flex; flex-direction: column; gap: 1.5rem;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4); min-width: 450px;
        }
        .dr-header { display: flex; justify-content: space-between; align-items: center; }
        .dr-header .title { color: #58a6ff; font-weight: 700; font-size: 1.1rem; text-shadow: 0 0 10px rgba(88,166,255,0.3); }
        .status-badge { padding: 0.3rem 0.8rem; border-radius: 2rem; font-size: 0.7rem; font-weight: 700; font-family: monospace; letter-spacing: 1px; }
        .status-badge.healthy { background: rgba(16,185,129,0.1); color: #34d399; border: 1px solid rgba(16,185,129,0.3); box-shadow: 0 0 10px rgba(16,185,129,0.2); }
        .status-badge.disaster { background: rgba(239,68,68,0.1); color: #f87171; border: 1px solid rgba(239,68,68,0.3); animation: blink 1s infinite alternate; }
        .status-badge.restoring_crd, .status-badge.restoring_vol, .status-badge.restoring_pods { background: rgba(245,158,11,0.1); color: #fbbf24; border: 1px solid rgba(245,158,11,0.3); }
        
        @keyframes blink { from { opacity: 1; } to { opacity: 0.5; } }

        .dr-visual-grid { display: grid; grid-template-columns: 1fr auto 1fr; gap: 1rem; align-items: stretch; }
        .dr-box { background: rgba(22,27,34,0.5); border: 1px solid #30363d; border-radius: 0.5rem; padding: 1rem; position: relative; overflow: hidden; display: flex; flex-direction: column; }
        .box-title { font-size: 0.8rem; font-weight: 600; color: #8b949e; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 1rem; border-bottom: 1px solid #30363d; padding-bottom: 0.5rem; }
        
        .k8s-objects { display: flex; flex-direction: column; gap: 0.8rem; flex: 1; justify-content: center; }
        .k8s-item { background: #010409; border: 1px solid #21262d; border-radius: 0.4rem; padding: 0.6rem; display: flex; align-items: center; justify-content: space-between; font-size: 0.75rem; font-family: monospace; color: #c9d1d9; transition: all 0.3s; }
        .k8s-item.active { border-color: #3b82f6; box-shadow: inset 0 0 10px rgba(59,130,246,0.1); }
        .k8s-item.active .indicator { width: 8px; height: 8px; border-radius: 50%; background: #34d399; box-shadow: 0 0 8px #34d399; }
        .k8s-item.dead { opacity: 0.4; border-color: #ef4444; background: rgba(239,68,68,0.05); }
        .k8s-item.dead .indicator { width: 8px; height: 8px; border-radius: 0%; background: #ef4444; }

        .overlay-red { position: absolute; inset: 0; background: rgba(239,68,68,0.8); backdrop-filter: blur(2px); display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.5rem; color: white; text-shadow: 0 2px 10px rgba(0,0,0,0.5); z-index: 10; letter-spacing: 2px; }

        .dr-sync { display: flex; align-items: center; justify-content: center; padding: 0 0.5rem; font-family: monospace; font-size: 0.7rem; font-weight: bold; }
        .arrow { padding: 0.3rem 0.5rem; border-radius: 1rem; }
        .arrow.flowing-right { color: #3b82f6; border: 1px dashed #3b82f6; animation: flowR 2s infinite linear; }
        .arrow.flowing-left { color: #f59e0b; border: 1px dashed #f59e0b; animation: flowL 1s infinite linear; background: rgba(245,158,11,0.1); }
        .arrow.dead { color: #ef4444; border: 1px solid #ef4444; background: rgba(239,68,68,0.1); }

        @keyframes flowR { 0% { transform: translateX(-5px); opacity: 0.5; } 50% { opacity: 1; } 100% { transform: translateX(5px); opacity: 0.5; } }
        @keyframes flowL { 0% { transform: translateX(5px); opacity: 0.5; } 50% { opacity: 1; } 100% { transform: translateX(-5px); opacity: 0.5; } }

        .s3-bucket { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; gap: 0.8rem; }
        .bucket-icon { font-size: 2rem; }
        .snapshot { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.4); padding: 0.75rem; border-radius: 0.5rem; font-family: monospace; font-size: 0.65rem; color: #34d399; text-align: center; line-height: 1.4; width: 100%; box-sizing: border-box; }
        .pulse-slow { animation: pSlow 3s infinite alternate; }
        .bright { background: rgba(16,185,129,0.3); box-shadow: 0 0 20px rgba(16,185,129,0.4); border-color: #34d399; }
        @keyframes pSlow { from { opacity: 0.7; } to { opacity: 1; } }

        .progress-container { margin-top: -0.5rem; }
        .progress-bar-bg { background: #010409; height: 6px; border-radius: 3px; overflow: hidden; border: 1px solid #21262d; }
        .progress-bar-fill { height: 100%; background: linear-gradient(90deg, #f59e0b, #eab308); transition: width 0.3s ease-out; }
        .progress-bar-fill.done { background: #10b981; }

        .controls { display: flex; gap: 0.75rem; }
        .btn { flex: 1; padding: 0.8rem; border-radius: 0.5rem; border: none; font-weight: 600; cursor: pointer; transition: all 0.2s; font-size: 0.8rem; }
        .btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .btn.nuke { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.4); }
        .btn.nuke:not(:disabled):hover { background: rgba(239,68,68,0.3); box-shadow: 0 0 20px rgba(239,68,68,0.3); }
        .btn.restore { background: rgba(245,158,11,0.15); color: #fbbf24; border: 1px solid rgba(245,158,11,0.4); }
        .btn.restore:not(:disabled):hover { background: rgba(245,158,11,0.3); box-shadow: 0 0 20px rgba(245,158,11,0.3); }

        .terminal { background: #010409; border-radius: 0.5rem; border: 1px solid #30363d; overflow: hidden; display: flex; flex-direction: column; }
        .terminal-header { background: #161b22; padding: 0.5rem 1rem; display: flex; align-items: center; gap: 1rem; font-family: monospace; font-size: 0.7rem; color: #8b949e; border-bottom: 1px solid #30363d; }
        .dots { display: flex; gap: 0.3rem; }
        .dots span { width: 8px; height: 8px; border-radius: 50%; }
        .dots span:nth-child(1) { background: #ff5f56; }
        .dots span:nth-child(2) { background: #ffbd2e; }
        .dots span:nth-child(3) { background: #27c93f; }
        .terminal-body { padding: 1rem; height: 120px; overflow-y: auto; font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; display: flex; flex-direction: column; gap: 0.3rem; }
        .dim { color: #4b5563; font-style: italic; }
        .terminal-body::-webkit-scrollbar { width: 6px; }
        .terminal-body::-webkit-scrollbar-thumb { background: #30363d; border-radius: 3px; }
      `}</style>
        </div>
    );
}
