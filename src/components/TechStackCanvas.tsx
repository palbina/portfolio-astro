import { useState, useEffect } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { currentLocale } from '../store/languageStore';

type TechCategory = 'infra' | 'cicd' | 'security' | 'observability' | 'dev';

interface TechItem {
    name: string;
    cat: TechCategory;
    icon: string;
}

const techItems: TechItem[] = [
    { name: 'Kubernetes', cat: 'infra', icon: '☸️' },
    { name: 'Talos Linux', cat: 'infra', icon: '🛡️' },
    { name: 'Docker', cat: 'infra', icon: '🐳' },
    { name: 'Longhorn', cat: 'infra', icon: '💾' },
    { name: 'AWS', cat: 'infra', icon: '☁️' },
    { name: 'ArgoCD', cat: 'cicd', icon: '🐙' },
    { name: 'Forgejo Actions', cat: 'cicd', icon: '⚡' },
    { name: 'Terraform', cat: 'cicd', icon: '🏗️' },
    { name: 'Ansible', cat: 'cicd', icon: '⚙️' },
    { name: 'Istio Ambient', cat: 'security', icon: '🕸️' },
    { name: 'Cilium', cat: 'security', icon: '🐝' },
    { name: 'CrowdSec', cat: 'security', icon: '🚷' },
    { name: 'Authentik', cat: 'security', icon: '🔐' },
    { name: 'Prometheus', cat: 'observability', icon: '🔥' },
    { name: 'Grafana', cat: 'observability', icon: '📊' },
    { name: 'Loki', cat: 'observability', icon: '📝' },
    { name: 'Astro', cat: 'dev', icon: '🚀' },
    { name: 'Qdrant', cat: 'dev', icon: '🧠' },
    { name: 'Python', cat: 'dev', icon: '🐍' },
    { name: 'Go', cat: 'dev', icon: '🐹' },
];

export default function TechStackCanvas() {
    const [activeCat, setActiveCat] = useState<TechCategory | null>(null);
    const locale = useStore(currentLocale) as 'en' | 'es';

    const t = locale === 'en' ? {
        title: 'Technology Constellation',
        infra: 'Platform & Infrastructure',
        cicd: 'GitOps & Automation',
        security: 'Zero Trust Network',
        observability: 'Observability Stack',
        dev: 'Software & AI'
    } : {
        title: 'Constelación Tecnológica',
        infra: 'Plataforma e Infraestructura',
        cicd: 'GitOps y Automatización',
        security: 'Red Zero Trust',
        observability: 'Pila de Observabilidad',
        dev: 'Desarrollo e IA',
    };

    const categories = [
        { id: 'infra', label: t.infra, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
        { id: 'cicd', label: t.cicd, color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
        { id: 'security', label: t.security, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
        { id: 'observability', label: t.observability, color: '#facc15', bg: 'rgba(250,204,21,0.1)' },
        { id: 'dev', label: t.dev, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    ];

    return (
        <div className="tech-canvas-container">
            <div className="canvas-header">
                <h3 className="canvas-title">✨ {t.title}</h3>
            </div>

            <div className="cat-filters">
                {categories.map(c => (
                    <button
                        key={c.id}
                        className={`cat-btn ${activeCat === c.id ? 'active' : ''}`}
                        onMouseEnter={() => setActiveCat(c.id as TechCategory)}
                        onMouseLeave={() => setActiveCat(null)}
                        style={{
                            borderColor: activeCat === c.id ? c.color : '#30363d',
                            background: activeCat === c.id ? c.bg : 'rgba(22,27,34,0.5)',
                            color: activeCat === c.id ? c.color : '#8b949e',
                            boxShadow: activeCat === c.id ? `0 0 15px ${c.bg}` : 'none'
                        }}
                    >
                        {c.label}
                    </button>
                ))}
            </div>

            <div className="nodes-grid">
                {techItems.map(tech => {
                    const catDef = categories.find(c => c.id === tech.cat);
                    const isFaded = activeCat !== null && activeCat !== tech.cat;
                    const isHighlighted = activeCat === tech.cat;

                    return (
                        <div
                            key={tech.name}
                            className={`tech-node ${isFaded ? 'faded' : ''} ${isHighlighted ? 'highlighted' : ''}`}
                            style={{
                                borderColor: isHighlighted ? catDef?.color : '#30363d',
                                boxShadow: isHighlighted ? `0 4px 20px ${catDef?.bg}` : 'none',
                            }}
                        >
                            <div className="tech-icon">{tech.icon}</div>
                            <div className="tech-name">{tech.name}</div>
                        </div>
                    );
                })}
            </div>

            <style>{`
        .tech-canvas-container {
          background: linear-gradient(145deg, #0d1117 0%, #0a0c10 100%);
          border-radius: 1.5rem; padding: 2.5rem; border: 1px solid rgba(255,255,255,0.05);
          font-family: 'Inter', system-ui, sans-serif; display: flex; flex-direction: column; gap: 2rem;
          box-shadow: 0 20px 40px rgba(0,0,0,0.6); position: relative; overflow: hidden;
        }
        .tech-canvas-container::before {
          content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
          background: radial-gradient(circle at center, rgba(59,130,246,0.05) 0%, transparent 60%); pointer-events: none;
        }

        .canvas-header { text-align: center; z-index: 1; }
        .canvas-title { font-size: 1.5rem; font-weight: 800; color: #f8fafc; margin: 0; background: linear-gradient(90deg, #f8fafc, #94a3b8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

        .cat-filters { display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center; z-index: 1; margin-bottom: 1rem; }
        .cat-btn { padding: 0.5rem 1.2rem; border-radius: 2rem; border: 1px solid; cursor: pointer; font-size: 0.8rem; font-weight: 600; font-family: 'JetBrains Mono', monospace; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .cat-btn:hover { transform: translateY(-2px); }

        .nodes-grid { display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; z-index: 1; }
        .tech-node { background: rgba(22,27,34,0.6); border: 1px solid #30363d; border-radius: 1rem; padding: 1rem 1.5rem; display: flex; align-items: center; gap: 1rem; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); cursor: default; backdrop-filter: blur(10px); }
        
        .tech-node:hover { transform: translateY(-3px) scale(1.05); border-color: #8b949e !important; box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important; z-index: 10; background: rgba(33,38,45,0.9); }
        
        .tech-node.faded { opacity: 0.2; filter: grayscale(1); transform: scale(0.95); }
        .tech-node.highlighted { transform: translateY(-2px) scale(1.02); background: rgba(33,38,45,0.8); }

        .tech-icon { font-size: 1.5rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); }
        .tech-name { color: #e2e8f0; font-weight: 600; font-size: 0.9rem; letter-spacing: 0.5px; }

        @media (max-width: 768px) {
          .tech-canvas-container { padding: 1.5rem; }
          .cat-btn { padding: 0.4rem 0.8rem; font-size: 0.75rem; }
          .tech-node { padding: 0.8rem 1rem; }
        }
      `}</style>
        </div>
    );
}
