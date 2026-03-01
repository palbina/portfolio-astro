import { useState, useRef, useEffect } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { currentLocale } from '../store/languageStore';

type Packet = { id: number; type: 'valid' | 'malicious'; currStep: number; status: 'moving' | 'blocked' | 'delivered'; topOffset: number };

export default function ZeroTrustSimulator() {
    const [packets, setPackets] = useState<Packet[]>([]);
    const [logs, setLogs] = useState<string[]>([]);
    const locale = useStore(currentLocale) as 'en' | 'es';
    const packetIdRef = useRef(0);
    const logsRef = useRef<HTMLDivElement>(null);

    const t = locale === 'en' ? {
        title: 'Zero Trust Enforcer (Cilium + Authentik)',
        sendNormal: 'Send Valid Traffic',
        sendMalicious: 'Simulate Attack Vector',
        authStep: 'Authentik IdP',
        policyStep: 'Cilium eBPF L7 Policy',
        dbStep: 'Target Workload',
        liveLogs: 'Audit & Network Logs',
        waiting: 'Awaiting traffic...',
    } : {
        title: 'Monitor Zero Trust (Cilium + Authentik)',
        sendNormal: 'Enviar Tráfico Válido',
        sendMalicious: 'Simular Vector Ataque',
        authStep: 'Authentik IdP',
        policyStep: 'Política eBPF Cilium',
        dbStep: 'App Destino',
        liveLogs: 'Logs de Auditoría',
        waiting: 'Esperando tráfico...',
    };

    useEffect(() => { if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight; }, [logs]);

    useEffect(() => {
        if (packets.length === 0) return;
        const interval = setInterval(() => {
            setPackets(prev => {
                let activePackets = false;
                const next = prev.map(p => {
                    if (p.status !== 'moving') return p;
                    activePackets = true;
                    if (p.currStep < 90) {
                        let nextStep = p.currStep + 5;
                        let newStatus: 'moving' | 'blocked' | 'delivered' = p.status;

                        // Reached Authentik
                        if (nextStep >= 30 && nextStep < 40 && p.type === 'valid' && p.currStep < 30) {
                            addLog(`[SSO] Validating JWT Token for Session ID #${p.id}... OK`);
                        }

                        // Reached Cilium
                        if (nextStep >= 65 && nextStep < 70) {
                            if (p.type === 'malicious') {
                                newStatus = 'blocked';
                                addLog(`[eBPF DROP] Malicious packet #${p.id} dropped at L3/L4/L7 by Cilium.`);
                                return { ...p, currStep: 65, status: newStatus };
                            } else if (p.currStep < 65) {
                                addLog(`[POLICY ALLOW] Packet #${p.id} matched mTLS Identity policy.`);
                            }
                        }

                        // Target reached
                        if (nextStep >= 90) {
                            newStatus = 'delivered';
                            addLog(`[SUCCESS] Traffic #${p.id} successfully processed by backend.`);
                            return { ...p, currStep: 90, status: newStatus };
                        }

                        return { ...p, currStep: nextStep, status: newStatus };
                    }
                    return p;
                });
                if (!activePackets) clearInterval(interval);
                return next;
            });
        }, 100);
        return () => clearInterval(interval);
    }, [packets]);

    const addLog = (msg: string) => {
        const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLogs(prev => [...prev.slice(-15), `[${time}] ${msg}`]);
    };

    const sendPacket = (type: 'valid' | 'malicious') => {
        packetIdRef.current++;
        const pId = packetIdRef.current;
        addLog(`[INGRESS] Incoming connection req #${pId} (${type.toUpperCase()})...`);
        // Randomize slight Y offset so packets don't overlap totally
        const topOffset = Math.floor(Math.random() * 20) - 10;
        setPackets(prev => [...prev, { id: pId, type, currStep: 0, status: 'moving', topOffset }]);
    };

    return (
        <div className="zt-simulator-container">
            <div className="zt-header">
                <div className="title">🕵️‍♂️ {t.title}</div>
            </div>

            <div className="zt-visual-area">
                {/* Background Network Grid */}
                <div className="zt-grid-bg"></div>

                {/* Lines */}
                <svg className="zt-connections" xmlns="http://www.w3.org/2000/svg">
                    <line x1="10%" y1="50%" x2="90%" y2="50%" stroke="#30363d" strokeWidth="2" strokeDasharray="5,5" />
                    <line x1="10%" y1="50%" x2="90%" y2="50%" stroke="#10b981" strokeWidth="2" strokeOpacity="0.3" className="animated-flow" />
                </svg>

                {/* Infrastructure Nodes */}
                <div className="zt-node user">
                    <div className="icon">👤</div>
                    <div className="label">User</div>
                </div>
                <div className="zt-node auth">
                    <div className="icon">🛡️</div>
                    <div className="label">{t.authStep}</div>
                </div>
                <div className="zt-node cilium">
                    <div className="icon cilium-icon">🐝</div>
                    <div className="label">{t.policyStep}</div>
                </div>
                <div className="zt-node target">
                    <div className="icon postgres">📦</div>
                    <div className="label">{t.dbStep}</div>
                </div>

                {/* Live Packets */}
                {packets.map(p => (
                    <div key={p.id}
                        className={`zt-packet ${p.type} ${p.status}`}
                        style={{ left: `${p.currStep}%`, top: `calc(50% + ${p.topOffset}px)` }}
                    />
                ))}

                {/* Defensive Laser effect for blocked packets */}
                {packets.filter(p => p.status === 'blocked').map(p => (
                    <div key={`boom-${p.id}`} className="zt-explosion" style={{ left: '65%', top: `calc(50% + ${p.topOffset}px)` }} />
                ))}
            </div>

            <div className="zt-controls">
                <button className="btn valid" onClick={() => sendPacket('valid')}>{t.sendNormal}</button>
                <button className="btn malicious" onClick={() => sendPacket('malicious')}>{t.sendMalicious}</button>
                <button className="btn reset" onClick={() => { setPackets([]); setLogs([t.waiting]); }}>↺</button>
            </div>

            <div className="terminal">
                <div className="terminal-header">
                    <div className="dots"><span /><span /><span /></div>
                    <span>&gt;_ {t.liveLogs}</span>
                </div>
                <div className="terminal-body" ref={logsRef}>
                    {logs.length === 0 ? <span className="dim">{t.waiting}</span> :
                        logs.map((log, i) => (
                            <div key={i} style={{ color: log.includes('[SUCCESS]') || log.includes('[ALLOW]') ? '#34d399' : log.includes('DROP') ? '#f87171' : log.includes('[SSO]') ? '#60a5fa' : '#c9d1d9' }}>
                                {log}
                            </div>
                        ))}
                </div>
            </div>

            <style>{`
        .zt-simulator-container {
          background: linear-gradient(145deg, #0d1117 0%, #0a0c10 100%);
          border-radius: 1rem; padding: 1.5rem; border: 1px solid rgba(255,255,255,0.1);
          font-family: 'Inter', system-ui, sans-serif; display: flex; flex-direction: column; gap: 1.5rem;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4); min-width: 450px;
        }
        .zt-header { display: flex; justify-content: space-between; align-items: center; }
        .zt-header .title { color: #58a6ff; font-weight: 700; font-size: 1.1rem; text-shadow: 0 0 10px rgba(88,166,255,0.3); }
        
        .zt-visual-area { height: 220px; background: #010409; border-radius: 0.75rem; border: 1px solid #21262d; position: relative; overflow: hidden; display: flex; align-items: center; box-shadow: inset 0 0 50px rgba(0,0,0,0.6); }
        
        .zt-grid-bg { position: absolute; inset: 0; background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px); background-size: 20px 20px; z-index: 0; pointer-events: none; }
        
        .zt-connections { position: absolute; width: 100%; height: 100%; z-index: 1; pointer-events: none; }
        .animated-flow { stroke-dasharray: 10; animation: sprint 1s linear infinite; }
        @keyframes sprint { to { stroke-dashoffset: -20; } }

        .zt-node { position: absolute; z-index: 2; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: translate(-50%, -50%); }
        .zt-node .icon { font-size: 1.5rem; width: 3.5rem; height: 3.5rem; display: flex; align-items: center; justify-content: center; background: rgba(33,38,45,0.8); border-radius: 0.5rem; box-shadow: 0 4px 15px rgba(0,0,0,0.4); backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,0.1); z-index: 2; }
        .zt-node .label { color: #c9d1d9; font-size: 0.65rem; font-weight: 600; margin-top: 0.5rem; background: #0d1117; padding: 0.2rem 0.6rem; border-radius: 1rem; border: 1px solid #30363d; white-space: nowrap; }
        
        .user { left: 10%; top: 50%; }
        .user .icon { border-radius: 50%; border-color: #3b82f6; box-shadow: 0 0 20px rgba(59,130,246,0.3); }
        .auth { left: 35%; top: 50%; }
        .auth .icon { border-color: #f59e0b; box-shadow: 0 0 20px rgba(245,158,11,0.2); }
        .cilium { left: 65%; top: 50%; }
        .cilium .icon { border-color: #8b5cf6; box-shadow: 0 0 20px rgba(139,92,246,0.3); background: rgba(139,92,246,0.1); }
        .target { left: 90%; top: 50%; }
        .target .icon { border-color: #10b981; }

        .zt-packet { position: absolute; width: 12px; height: 12px; border-radius: 50%; z-index: 3; transition: left 0.1s linear, top 0.1s linear; transform: translate(-50%, -50%); display: flex; align-items: center; justify-content: center; }
        .zt-packet::after { content: ''; width: 4px; height: 4px; border-radius: 50%; background: white; }
        .zt-packet.valid { background: #3b82f6; box-shadow: 0 0 10px #3b82f6, 0 0 20px #3b82f6; }
        .zt-packet.malicious { background: #ef4444; box-shadow: 0 0 10px #ef4444, 0 0 20px #ef4444; }
        .zt-packet.delivered { transform: translate(-50%, -50%) scale(1.5); opacity: 0; transition: all 0.5s ease-out; background: #10b981; box-shadow: 0 0 30px #10b981; }
        .zt-packet.blocked { display: none; }

        .zt-explosion { position: absolute; width: 40px; height: 40px; border-radius: 50%; background: radial-gradient(circle, #ef4444 0%, transparent 70%); transform: translate(-50%, -50%); z-index: 4; animation: explode 0.5s ease-out forwards; pointer-events: none; }
        @keyframes explode { 0% { opacity: 1; transform: translate(-50%, -50%) scale(0.5); } 100% { opacity: 0; transform: translate(-50%, -50%) scale(2); } }

        .zt-controls { display: flex; gap: 0.75rem; }
        .btn { padding: 0.8rem; border-radius: 0.5rem; border: none; font-weight: 600; cursor: pointer; transition: all 0.2s; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
        .btn.valid { flex: 1; background: rgba(59,130,246,0.15); color: #60a5fa; border: 1px solid rgba(59,130,246,0.4); }
        .btn.valid:hover { background: rgba(59,130,246,0.3); box-shadow: 0 0 20px rgba(59,130,246,0.3); transform: translateY(-2px); }
        .btn.malicious { flex: 1; background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.4); }
        .btn.malicious:hover { background: rgba(239,68,68,0.3); box-shadow: 0 0 20px rgba(239,68,68,0.3); transform: translateY(-2px); }
        .btn.reset { flex: 0 0 50px; background: rgba(255,255,255,0.05); color: #c9d1d9; border: 1px solid rgba(255,255,255,0.1); }
        .btn.reset:hover { background: rgba(255,255,255,0.1); }

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
