import { useState, useRef, useEffect } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { currentLocale } from '../store/languageStore';

export default function ForgejoActionsSimulator() {
    const [logs, setLogs] = useState<string[]>([]);
    const [workflow, setWorkflow] = useState<number>(0);
    const [jobState, setJobState] = useState<'idle' | 'cloning' | 'linting' | 'building' | 'pushing' | 'success'>('idle');
    const [activeAction, setActiveAction] = useState<boolean>(false);
    const logsRef = useRef<HTMLDivElement>(null);

    const locale = useStore(currentLocale) as 'en' | 'es';

    const t = locale === 'en' ? {
        title: 'Self-Hosted CI/CD: Forgejo Actions',
        trigger: 'git push origin main',
        clone: 'Cloning Repository',
        lint: 'Running Linters',
        build: 'Building Docker Image',
        push: 'Pushing to GHCR Registry',
        waiting: 'Awaiting webhook trigger...'
    } : {
        title: 'CI/CD Privado: Forgejo Actions',
        trigger: 'git push origin main',
        clone: 'Clonando Repositorio',
        lint: 'Análisis de Código (Linting)',
        build: 'Compilando Imagen Docker',
        push: 'Empujando a Registry',
        waiting: 'Esperando evento webhook...'
    };

    useEffect(() => { if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight; }, [logs]);

    const addLog = (msg: string, color = '#c9d1d9') => {
        const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLogs(prev => [...prev.slice(-15), `<span style="color:#6b7280">[${time}]</span> <span style="color:${color}">${msg}</span>`]);
    };

    const startPipeline = () => {
        if (activeAction) return;
        setActiveAction(true);
        setLogs([]);
        setJobState('cloning');
        addLog(`event: push, ref: refs/heads/main`, '#a78bfa');

        setTimeout(() => {
            addLog(`Spinning up ephemeral runner pod (forgejo-runner-7b4d)...`, '#3b82f6');
            addLog(`Running job 'build-and-push'`, '#3b82f6');

            setTimeout(() => {
                setJobState('linting');
                setWorkflow(25);
                addLog(`[Step 1] Code Checkout completed.`, '#34d399');
                addLog(`[Step 2] Executing ESLint and Prettier check...`);

                setTimeout(() => {
                    setJobState('building');
                    setWorkflow(50);
                    addLog(`[Step 2] Linting passed successfully!`, '#34d399');
                    addLog(`[Step 3] Building Dockerfile (Cache hit: 4 layers)...`);

                    setTimeout(() => {
                        setJobState('pushing');
                        setWorkflow(75);
                        addLog(`[Step 3] Built Image: sha256:d8a2...f119`, '#34d399');
                        addLog(`[Step 4] Pushing tag arkenops/frontend:latest to GHCR...`);

                        setTimeout(() => {
                            setJobState('success');
                            setWorkflow(100);
                            addLog(`[Step 4] Pushed successfully.`, '#34d399');
                            addLog(`Tearing down ephemeral runner pod. Job completed in ` + ((Math.random() * 2) + 3).toFixed(1) + `s.`, '#60a5fa');
                            setActiveAction(false);
                        }, 1000);
                    }, 1200);
                }, 800);
            }, 700);
        }, 500);
    };

    return (
        <div className="forgejo-container">
            <div className="forgejo-header">
                <div className="title">🚀 {t.title}</div>
            </div>

            <div className="pipeline-board">
                <div className={`step-node ${jobState === 'idle' ? 'dimmed' : ''} ${workflow >= 25 ? 'done' : jobState === 'cloning' ? 'active' : ''}`}>
                    <div className="icon">⬇️</div>
                    <div className="label">{t.clone}</div>
                </div>
                <div className="connector">
                    <div className="line" style={{ width: workflow >= 25 ? '100%' : '0%' }} />
                </div>

                <div className={`step-node ${workflow < 25 ? 'dimmed' : ''} ${workflow >= 50 ? 'done' : jobState === 'linting' ? 'active' : ''}`}>
                    <div className="icon">🧹</div>
                    <div className="label">{t.lint}</div>
                </div>
                <div className="connector">
                    <div className="line" style={{ width: workflow >= 50 ? '100%' : '0%' }} />
                </div>

                <div className={`step-node ${workflow < 50 ? 'dimmed' : ''} ${workflow >= 75 ? 'done' : jobState === 'building' ? 'active' : ''}`}>
                    <div className="icon">🐳</div>
                    <div className="label">{t.build}</div>
                </div>
                <div className="connector">
                    <div className="line" style={{ width: workflow >= 75 ? '100%' : '0%' }} />
                </div>

                <div className={`step-node ${workflow < 75 ? 'dimmed' : ''} ${jobState === 'success' ? 'done' : jobState === 'pushing' ? 'active' : ''}`}>
                    <div className="icon">⬆️</div>
                    <div className="label">{t.push}</div>
                </div>
            </div>

            <div className="controls">
                <button className="btn run" onClick={startPipeline} disabled={activeAction}>👨‍💻 {t.trigger}</button>
            </div>

            <div className="terminal">
                <div className="terminal-header">
                    <div className="dots"><span /><span /><span /></div>
                    <span>&gt;_ Runner Execution Log</span>
                </div>
                <div className="terminal-body" ref={logsRef}>
                    {logs.length === 0 ? <span className="dim">{t.waiting}</span> :
                        logs.map((log, i) => <div key={i} dangerouslySetInnerHTML={{ __html: log }} />)}
                </div>
            </div>

            <style>{`
        .forgejo-container {
          background: linear-gradient(145deg, #0d1117 0%, #0a0c10 100%);
          border-radius: 1rem; padding: 1.5rem; border: 1px solid rgba(255,255,255,0.1);
          font-family: 'Inter', system-ui, sans-serif; display: flex; flex-direction: column; gap: 1.5rem;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4); min-width: 450px;
        }
        .forgejo-header .title { color: #f97316; font-weight: 700; font-size: 1.1rem; text-shadow: 0 0 10px rgba(249,115,22,0.3); }
        
        .pipeline-board { background: #010409; border-radius: 0.75rem; border: 1px solid #21262d; padding: 2rem 1rem; display: flex; justify-content: space-between; align-items: center; box-shadow: inset 0 0 30px rgba(0,0,0,0.5); }
        
        .step-node { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; width: 80px; transition: all 0.3s; z-index: 2; }
        .step-node .icon { width: 40px; height: 40px; border-radius: 50%; background: #161b22; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; border: 2px solid #30363d; transition: all 0.3s; box-shadow: 0 0 10px rgba(0,0,0,0.5); }
        .step-node .label { color: #8b949e; font-size: 0.6rem; text-align: center; font-weight: 600; font-family: monospace; transition: all 0.3s; }
        
        .step-node.dimmed { opacity: 0.3; filter: grayscale(1); }
        .step-node.active .icon { border-color: #3b82f6; box-shadow: 0 0 15px rgba(59,130,246,0.5); animation: spinScale 1.5s infinite alternate; }
        .step-node.active .label { color: #60a5fa; }
        .step-node.done .icon { border-color: #10b981; background: rgba(16,185,129,0.1); box-shadow: 0 0 10px rgba(16,185,129,0.3); }
        .step-node.done .label { color: #34d399; }
        
        @keyframes spinScale { 0% { transform: scale(1); } 100% { transform: scale(1.1); } }
        
        .connector { flex: 1; height: 4px; background: #30363d; margin: 0 -20px; position: relative; top: -12px; z-index: 1; }
        .connector .line { height: 100%; background: #10b981; transition: width 0.5s linear; box-shadow: 0 0 5px #10b981; }

        .controls { display: flex; gap: 0.75rem; }
        .btn { flex: 1; padding: 0.8rem; border-radius: 0.5rem; border: none; font-weight: 600; cursor: pointer; transition: all 0.2s; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; gap: 0.4rem; color: #c9d1d9; }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn.run { background: rgba(249,115,22,0.15); border: 1px solid rgba(249,115,22,0.4); color: #fb923c; }
        .btn.run:not(:disabled):hover { transform: translateY(-2px); background: rgba(249,115,22,0.3); box-shadow: 0 0 15px rgba(249,115,22,0.2); }

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
