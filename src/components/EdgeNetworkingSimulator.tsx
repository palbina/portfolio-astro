import { useState, useEffect, useRef } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { currentLocale } from '../store/languageStore';

export default function EdgeNetworkingSimulator() {
    const [traffic, setTraffic] = useState<{ id: number; path: string; status: 'flying' | 'routed' | 'blocked' | 'done'; left: number; top: number; type: 'normal' | 'ddos' }[]>([]);
    const [logs, setLogs] = useState<string[]>([]);
    const [stats, setStats] = useState({ reqs: 0, blocked: 0 });
    const idRef = useRef(0);
    const locale = useStore(currentLocale) as 'en' | 'es';

    const t = locale === 'en' ? {
        title: 'Edge Routing & WAF Simulator',
        sendApi: '→ Send /api Request',
        sendWeb: '→ Send /web Request',
        ddos: '☢️ Simulate DDoS',
        logs: 'Traefik Access Logs',
        tunnel: 'Cloudflare Tunnel',
        router: 'Traefik Ingress',
        apiSvc: 'API Service',
        webSvc: 'Web Service'
    } : {
        title: 'Simulador Enrutamiento y WAF',
        sendApi: '→ Petición /api',
        sendWeb: '→ Petición /web',
        ddos: '☢️ Simular DDoS',
        logs: 'Logs de Acceso Traefik',
        tunnel: 'Túnel Cloudflare',
        router: 'Ingress Traefik',
        apiSvc: 'Servicio API',
        webSvc: 'Servicio Web'
    };

    const logsRef = useRef<HTMLDivElement>(null);
    useEffect(() => { if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight; }, [logs]);

    const addLog = (msg: string, isError: boolean = false) => {
        const time = new Date().toISOString();
        setLogs(p => [...p.slice(-15), `<span style="color:${isError ? '#f87171' : '#34d399'}">[${time}] ${msg}</span>`]);
    };

    useEffect(() => {
        const it = setInterval(() => {
            setTraffic(prev => prev.map(p => {
                if (p.status === 'done') return p;
                let nLeft = p.left + (p.type === 'ddos' ? 6 : 3);
                let nTop = p.top;
                let nStatus: 'flying' | 'routed' | 'blocked' | 'done' = p.status;

                // Reach Traefik
                if (nLeft >= 40 && nLeft < 60 && p.status === 'flying') {
                    if (p.type === 'ddos') {
                        nStatus = 'blocked' as const;
                        setStats(s => ({ ...s, blocked: s.blocked + 1 }));
                        addLog(`WARN: CrowdSec WAF Blocked malicious IP - HTTP 403 Forbidden`, true);
                        return { ...p, status: 'done' as const, left: 45 };
                    } else {
                        nStatus = 'routed' as const;
                    }
                }

                // Routing path
                if (nStatus === 'routed' && nLeft >= 50) {
                    if (p.path === '/api') nTop += 2;
                    else if (p.path === '/web') nTop -= 2;
                }

                // Reached destination
                if (nLeft >= 85) {
                    nStatus = 'done' as const;
                    setStats(s => ({ ...s, reqs: s.reqs + 1 }));
                    addLog(`INFO: Routed ${p.path} -> ${p.path === '/api' ? '10.42.1.5:8080' : '10.42.2.8:80'} HTTP/2.0 200 OK`, false);
                }

                return { ...p, left: nLeft, top: nTop, status: nStatus };
            }).filter(p => p.status !== 'done' || (p.type === 'ddos' && p.left < 50))); // remove completely if done and not ddos
        }, 50);
        return () => clearInterval(it);
    }, []);

    const triggerClick = (path: string, type: 'normal' | 'ddos' = 'normal') => {
        if (type === 'ddos') {
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    setTraffic(prev => [...prev, { id: idRef.current++, path, status: 'flying', left: 0, top: 45, type: 'ddos' }]);
                }, i * 100);
            }
        } else {
            setTraffic(prev => [...prev, { id: idRef.current++, path, status: 'flying', left: 0, top: 45, type: 'normal' }]);
        }
    };

    return (
        <div className="edge-simulator-container">
            <div className="edge-header">
                <div className="title">🌐 {t.title}</div>
                <div className="stats-badges">
                    <span className="badge normal">{stats.reqs} 200 OK</span>
                    <span className="badge blocked">{stats.blocked} 403 WAF</span>
                </div>
            </div>

            <div className="visualization-area">
                {/* Connection Lines */}
                <svg className="connections" xmlns="http://www.w3.org/2000/svg">
                    <line x1="15%" y1="50%" x2="45%" y2="50%" stroke="#30363d" strokeWidth="2" strokeDasharray="5,5" className="flowing-line" />
                    <path d="M 55% 50% L 75% 50% L 85% 75%" fill="none" stroke="#3b82f6" strokeWidth="2" strokeOpacity="0.5" />
                    <path d="M 55% 50% L 75% 50% L 85% 25%" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeOpacity="0.5" />
                </svg>

                {/* Nodes */}
                <div className="node cloudflare">
                    <div className="icon">☁️</div>
                    <div className="label">{t.tunnel}</div>
                </div>
                <div className="node traefik">
                    <div className="icon">🚦</div>
                    <div className="label">{t.router}</div>
                    <div className="sub-label">CrowdSec WAF</div>
                </div>
                <div className="node backend web">
                    <div className="icon">🖥️</div>
                    <div className="label">{t.webSvc}</div>
                </div>
                <div className="node backend api">
                    <div className="icon">⚙️</div>
                    <div className="label">{t.apiSvc}</div>
                </div>

                {/* Packets */}
                {traffic.map(p => (
                    p.status !== 'done' || (p.status === 'done' && p.type === 'ddos') ?
                        <div key={p.id} className={`packet ${p.type} ${p.status}`} style={{ left: `${p.left}%`, top: `${p.top}%` }} /> : null
                ))}
            </div>

            <div className="controls">
                <button className="btn api" onClick={() => triggerClick('/api')}>{t.sendApi}</button>
                <button className="btn web" onClick={() => triggerClick('/web')}>{t.sendWeb}</button>
                <button className="btn ddos" onClick={() => triggerClick('/', 'ddos')}>{t.ddos}</button>
            </div>

            <div className="terminal">
                <div className="terminal-header">
                    <div className="dots"><span /><span /><span /></div>
                    <span>{t.logs}</span>
                </div>
                <div className="terminal-body" ref={logsRef}>
                    {logs.length === 0 ? <span className="dim">Waiting for incoming connections...</span> :
                        logs.map((l, i) => <div key={i} dangerouslySetInnerHTML={{ __html: l }} />)}
                </div>
            </div>

            <style>{`
        .edge-simulator-container {
          background: linear-gradient(145deg, #0d1117 0%, #0a0c10 100%);
          border-radius: 1rem; padding: 1.5rem; border: 1px solid rgba(255,255,255,0.1);
          font-family: 'Inter', system-ui, sans-serif; display: flex; flex-direction: column; gap: 1.5rem;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4); min-width: 450px;
        }
        .edge-header { display: flex; justify-content: space-between; align-items: center; }
        .edge-header .title { color: #58a6ff; font-weight: 700; font-size: 1.1rem; text-shadow: 0 0 10px rgba(88,166,255,0.3); }
        .stats-badges { display: flex; gap: 0.5rem; }
        .badge { padding: 0.2rem 0.6rem; border-radius: 1rem; font-size: 0.7rem; font-weight: 600; font-family: monospace; }
        .badge.normal { background: rgba(16,185,129,0.1); color: #34d399; border: 1px solid rgba(16,185,129,0.3); }
        .badge.blocked { background: rgba(239,68,68,0.1); color: #f87171; border: 1px solid rgba(239,68,68,0.3); }
        
        .visualization-area {
          height: 200px; background: #010409; border-radius: 0.75rem; border: 1px solid #21262d;
          position: relative; overflow: hidden; display: flex; align-items: center;
          box-shadow: inset 0 0 20px rgba(0,0,0,0.5);
        }
        .connections { position: absolute; width: 100%; height: 100%; z-index: 1; pointer-events: none; }
        .flowing-line { stroke-dasharray: 5; animation: flow 20s linear infinite; }
        @keyframes flow { to { stroke-dashoffset: -1000; } }
        
        .node { position: absolute; z-index: 2; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: translate(-50%, -50%); }
        .node .icon { font-size: 1.5rem; width: 3rem; height: 3rem; display: flex; align-items: center; justify-content: center; background: rgba(33,38,45,0.8); border-radius: 50%; box-shadow: 0 4px 6px rgba(0,0,0,0.3); backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,0.1); z-index: 2; }
        .node .label { color: #c9d1d9; font-size: 0.7rem; font-weight: 600; margin-top: 0.5rem; background: rgba(0,0,0,0.5); padding: 0.2rem 0.5rem; border-radius: 0.25rem; }
        .node .sub-label { color: #8b949e; font-size: 0.6rem; }
        
        .cloudflare { left: 10%; top: 50%; }
        .traefik { left: 50%; top: 50%; }
        .traefik .icon { border-color: #3b82f6; box-shadow: 0 0 15px rgba(59,130,246,0.3); }
        .backend.web { left: 85%; top: 25%; }
        .backend.web .icon { border-color: #8b5cf6; }
        .backend.api { left: 85%; top: 75%; }
        .backend.api .icon { border-color: #3b82f6; }

        .packet { position: absolute; width: 8px; height: 8px; border-radius: 50%; z-index: 3; transition: left 0.05s linear, top 0.05s linear; transform: translate(-50%, -50%); }
        .packet.normal { background: #34d399; box-shadow: 0 0 10px #34d399, 0 0 20px rgba(52,211,153,0.5); }
        .packet.ddos { background: #ef4444; box-shadow: 0 0 10px #ef4444, 0 0 20px rgba(239,68,68,0.5); }
        .packet.blocked { transform: translate(-50%, -50%) scale(2); opacity: 0; transition: all 0.5s ease-out; }

        .controls { display: flex; gap: 0.75rem; }
        .btn { flex: 1; padding: 0.75rem; border-radius: 0.5rem; border: none; font-weight: 600; cursor: pointer; transition: all 0.2s; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
        .btn:hover { transform: translateY(-2px); }
        .btn.api { background: rgba(59,130,246,0.1); color: #60a5fa; border: 1px solid rgba(59,130,246,0.4); }
        .btn.api:hover { background: rgba(59,130,246,0.2); box-shadow: 0 0 15px rgba(59,130,246,0.2); }
        .btn.web { background: rgba(139,92,246,0.1); color: #a78bfa; border: 1px solid rgba(139,92,246,0.4); }
        .btn.web:hover { background: rgba(139,92,246,0.2); box-shadow: 0 0 15px rgba(139,92,246,0.2); }
        .btn.ddos { background: rgba(239,68,68,0.1); color: #f87171; border: 1px solid rgba(239,68,68,0.4); }
        .btn.ddos:hover { background: rgba(239,68,68,0.2); box-shadow: 0 0 15px rgba(239,68,68,0.2); }

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
