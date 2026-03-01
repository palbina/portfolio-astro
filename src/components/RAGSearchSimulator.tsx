import { useState, useRef, useEffect } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { currentLocale } from '../store/languageStore';

export default function RAGSearchSimulator() {
    const [logs, setLogs] = useState<string[]>([]);
    const [activeQuery, setActiveQuery] = useState<'k8s' | 'linux' | 'code' | null>(null);
    const [graphState, setGraphState] = useState<'idle' | 'routing' | 'vectorDB' | 'synthesizing' | 'done'>('idle');
    const logsRef = useRef<HTMLDivElement>(null);

    const locale = useStore(currentLocale) as 'en' | 'es';

    const t = locale === 'en' ? {
        title: 'AI Semantics: LangGraph & Qdrant RAG',
        q1: 'Query: "K8s networking issues"',
        q2: 'Query: "Talos core concepts"',
        q3: 'Query: "Search Python Scripts"',
        router: 'Neural Router',
        db: 'Qdrant Vector DB',
        llm: 'LLM Synthesizer',
        waiting: 'Awaiting semantic query...'
    } : {
        title: 'Semántica IA: LangGraph & Qdrant RAG',
        q1: 'Consulta: "Redes en K8s"',
        q2: 'Consulta: "Conceptos Talos"',
        q3: 'Consulta: "Scripts de Python"',
        router: 'Enrutador Neuronal',
        db: 'Qdrant Vector DB',
        llm: 'Sintetizador LLM',
        waiting: 'Esperando consulta semántica...'
    };

    useEffect(() => { if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight; }, [logs]);

    const addLog = (msg: string, color = '#c9d1d9') => {
        const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLogs(prev => [...prev.slice(-15), `<span style="color:#6b7280">[${time}]</span> <span style="color:${color}">${msg}</span>`]);
    };

    const triggerSearch = (queryType: 'k8s' | 'linux' | 'code') => {
        if (activeQuery) return;
        setActiveQuery(queryType);
        setLogs([]);
        setGraphState('routing');

        let queryStr = '';
        let targetColl = '';
        if (queryType === 'k8s') { queryStr = t.q1; targetColl = 'kubernetes_docs'; }
        if (queryType === 'linux') { queryStr = t.q2; targetColl = 'talos_linux_guides'; }
        if (queryType === 'code') { queryStr = t.q3; targetColl = 'python_snippets'; }

        addLog(`LangGraph: Received intent -> ${queryStr}`, '#eab308');

        setTimeout(() => {
            addLog(`[Router] Embedding query into 1536-dimensional vector...`, '#8b5cf6');
            addLog(`[Router] Categorizing intent. Routing to: <b>${targetColl}</b>`, '#a78bfa');
            setGraphState('vectorDB');

            setTimeout(() => {
                addLog(`[Qdrant] Searching '${targetColl}' collection...`);
                addLog(`[Qdrant] Found 4 chunks with cosine similarity > 0.87`, '#34d399');
                setGraphState('synthesizing');

                setTimeout(() => {
                    addLog(`[LLM] Passing context chunks to local LLM for generation...`);

                    setTimeout(() => {
                        addLog(`[Response] Generación completada con éxito.`, '#34d399');
                        setGraphState('done');

                        setTimeout(() => {
                            setActiveQuery(null);
                        }, 1000);
                    }, 1000);
                }, 800);
            }, 700);
        }, 600);
    };

    return (
        <div className="rag-container">
            <div className="rag-header">
                <div className="title">🧠 {t.title}</div>
            </div>

            <div className="graph-board">
                <div className={`ai-node router ${graphState === 'routing' ? 'pulse' : ''}`}>
                    <div className="icon">🔀</div>
                    <div className="label">{t.router}</div>
                </div>

                <div className={`ai-node qdrant ${graphState === 'vectorDB' ? 'pulse' : ''}`}>
                    <div className="icon">📊</div>
                    <div className="label">{t.db}</div>
                </div>

                <div className={`ai-node llm ${(graphState === 'synthesizing' || graphState === 'done') ? 'pulse' : ''} ${graphState === 'done' ? 'success' : ''}`}>
                    <div className="icon">🤖</div>
                    <div className="label">{t.llm}</div>
                </div>

                <svg className="graph-edges" xmlns="http://www.w3.org/2000/svg">
                    {/* Router to DB */}
                    <line x1="25%" y1="50%" x2="50%" y2="50%" stroke="#30363d" strokeWidth="2" strokeDasharray="4,4" />
                    <line x1="25%" y1="50%" x2="50%" y2="50%" stroke="#8b5cf6" strokeWidth="3" opacity={graphState === 'routing' || graphState === 'vectorDB' ? 1 : 0} className="animated-flow" />

                    {/* DB to LLM */}
                    <line x1="50%" y1="50%" x2="75%" y2="50%" stroke="#30363d" strokeWidth="2" strokeDasharray="4,4" />
                    <line x1="50%" y1="50%" x2="75%" y2="50%" stroke="#34d399" strokeWidth="3" opacity={graphState === 'synthesizing' ? 1 : 0} className="animated-flow" />
                </svg>
            </div>

            <div className="controls">
                <button className="btn k8s" onClick={() => triggerSearch('k8s')} disabled={!!activeQuery}>☸️ {t.q1.replace('Query: ', '').replace('Consulta: ', '')}</button>
                <button className="btn linux" onClick={() => triggerSearch('linux')} disabled={!!activeQuery}>🐧 {t.q2.replace('Query: ', '').replace('Consulta: ', '')}</button>
                <button className="btn code" onClick={() => triggerSearch('code')} disabled={!!activeQuery}>💻 {t.q3.replace('Query: ', '').replace('Consulta: ', '')}</button>
            </div>

            <div className="terminal">
                <div className="terminal-header">
                    <div className="dots"><span /><span /><span /></div>
                    <span>&gt;_ Agent Trace Log</span>
                </div>
                <div className="terminal-body" ref={logsRef}>
                    {logs.length === 0 ? <span className="dim">{t.waiting}</span> :
                        logs.map((log, i) => <div key={i} dangerouslySetInnerHTML={{ __html: log }} />)}
                </div>
            </div>

            <style>{`
        .rag-container {
          background: linear-gradient(145deg, #0d1117 0%, #0a0c10 100%);
          border-radius: 1rem; padding: 1.5rem; border: 1px solid rgba(255,255,255,0.1);
          font-family: 'Inter', system-ui, sans-serif; display: flex; flex-direction: column; gap: 1.5rem;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4); min-width: 450px;
        }
        .rag-header .title { color: #c084fc; font-weight: 700; font-size: 1.1rem; text-shadow: 0 0 10px rgba(192,132,252,0.4); }
        
        .graph-board { background: #010409; border-radius: 0.75rem; border: 1px solid #21262d; height: 160px; position: relative; box-shadow: inset 0 0 30px rgba(0,0,0,0.5); }
        
        .ai-node { position: absolute; top: 50%; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; gap: 0.5rem; z-index: 2; }
        .ai-node .icon { width: 50px; height: 50px; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; background: rgba(22,27,34,0.8); backdrop-filter: blur(5px); border: 1px solid #30363d; transition: all 0.3s ease; box-shadow: 0 4px 10px rgba(0,0,0,0.4); }
        .ai-node .label { color: #c9d1d9; font-size: 0.65rem; font-weight: 600; font-family: monospace; background: #0d1117; padding: 0.2rem 0.5rem; border-radius: 1rem; border: 1px solid #30363d; }
        
        .router { left: 25%; }
        .router.pulse .icon { border-color: #8b5cf6; box-shadow: 0 0 20px rgba(139,92,246,0.5); animation: nodePulse 0.5s infinite alternate; }
        
        .qdrant { left: 50%; }
        .qdrant.pulse .icon { border-color: #facc15; box-shadow: 0 0 20px rgba(250,204,21,0.5); animation: nodePulse 0.5s infinite alternate; }
        
        .llm { left: 75%; }
        .llm.pulse .icon { border-color: #3b82f6; box-shadow: 0 0 20px rgba(59,130,246,0.5); animation: nodePulse 0.5s infinite alternate; }
        .llm.success .icon { border-color: #10b981; box-shadow: 0 0 20px rgba(16,185,129,0.5); }
        
        @keyframes nodePulse { 0% { transform: scale(1); } 100% { transform: scale(1.15); } }

        .graph-edges { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 1; pointer-events: none; }
        .animated-flow { stroke-dasharray: 6; animation: packetFlow 0.5s linear infinite; }
        @keyframes packetFlow { to { stroke-dashoffset: -12; } }

        .controls { display: flex; gap: 0.5rem; }
        .btn { flex: 1; padding: 0.75rem; border-radius: 0.5rem; border: none; font-weight: 600; cursor: pointer; transition: all 0.2s; font-size: 0.75rem; display: flex; align-items: center; justify-content: center; gap: 0.3rem; color: #c9d1d9; }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn:not(:disabled):hover { transform: translateY(-2px); }
        .btn.k8s { background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.4); color: #60a5fa; }
        .btn.k8s:not(:disabled):hover { background: rgba(59,130,246,0.3); box-shadow: 0 0 15px rgba(59,130,246,0.2); }
        .btn.linux { background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.4); color: #fbbf24; }
        .btn.linux:not(:disabled):hover { background: rgba(245,158,11,0.3); box-shadow: 0 0 15px rgba(245,158,11,0.2); }
        .btn.code { background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.4); color: #34d399; }
        .btn.code:not(:disabled):hover { background: rgba(16,185,129,0.3); box-shadow: 0 0 15px rgba(16,185,129,0.2); }

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
