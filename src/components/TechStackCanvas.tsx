import { useState, useEffect } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { currentLocale } from '../store/languageStore';

type TechCategory = 'infra' | 'cicd' | 'security' | 'observability' | 'dev';

interface TechItem {
    name: string;
    cat: TechCategory;
    icon: string;
    summary: { en: string; es: string };
}

const techItems: TechItem[] = [
    { name: 'Kubernetes', cat: 'infra', icon: '☸️', summary: { en: 'Container Orchestration Engine', es: 'Motor de Orquestación de Contenedores' } },
    { name: 'Talos Linux', cat: 'infra', icon: '🛡️', summary: { en: 'Immutable OS for K8s', es: 'SO Inmutable para K8s' } },
    { name: 'Docker', cat: 'infra', icon: '🐳', summary: { en: 'Containerization Platform', es: 'Plataforma de Contenedores' } },
    { name: 'Longhorn', cat: 'infra', icon: '💾', summary: { en: 'Distributed Block Storage', es: 'Almacenamiento de Bloques Distribuido' } },
    { name: 'AWS', cat: 'infra', icon: '☁️', summary: { en: 'Amazon Web Services', es: 'Servicios en la Nube de Amazon' } },
    { name: 'ArgoCD', cat: 'cicd', icon: '🐙', summary: { en: 'Declarative GitOps Delivery', es: 'Entrega Continua Declarativa y GitOps' } },
    { name: 'Forgejo Actions', cat: 'cicd', icon: '⚡', summary: { en: 'Self-hosted CI/CD pipelines', es: 'Pipelines CI/CD Autoalojados' } },
    { name: 'Terraform', cat: 'cicd', icon: '🏗️', summary: { en: 'Infrastructure as Code', es: 'Infraestructura como Código' } },
    { name: 'Ansible', cat: 'cicd', icon: '⚙️', summary: { en: 'IT Automation & Configuration', es: 'Automatización y Configuración IT' } },
    { name: 'Istio Ambient', cat: 'security', icon: '🕸️', summary: { en: 'Sidecar-less Service Mesh', es: 'Service Mesh sin Sidecars' } },
    { name: 'Cilium', cat: 'security', icon: '🐝', summary: { en: 'eBPF-based Networking & Security', es: 'Redes y Seguridad basados en eBPF' } },
    { name: 'CrowdSec', cat: 'security', icon: '🚷', summary: { en: 'Collaborative IPS/WAF', es: 'IPS/WAF Colaborativo' } },
    { name: 'Authentik', cat: 'security', icon: '🔐', summary: { en: 'Identity Provider & SSO', es: 'Proveedor de Identidad y SSO' } },
    { name: 'Prometheus', cat: 'observability', icon: '🔥', summary: { en: 'Metrics Monitoring & Alerting', es: 'Monitoreo de Métricas y Alertas' } },
    { name: 'Grafana', cat: 'observability', icon: '📊', summary: { en: 'Observability Dashboards', es: 'Dashboards de Observabilidad' } },
    { name: 'Loki', cat: 'observability', icon: '📝', summary: { en: 'Log Aggregation System', es: 'Sistema de Agregación de Logs' } },
    { name: 'Astro', cat: 'dev', icon: '🚀', summary: { en: 'Web Framework for Content', es: 'Framework Web para Contenido' } },
    { name: 'Qdrant', cat: 'dev', icon: '🧠', summary: { en: 'Vector Search Database', es: 'Base de Datos Vectorial' } },
    { name: 'Python', cat: 'dev', icon: '🐍', summary: { en: 'Automation & Scripting', es: 'Automatización y Scripting' } },
    { name: 'Go', cat: 'dev', icon: '🐹', summary: { en: 'High-Performance Backend', es: 'Backend de Alto Rendimiento' } },
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

                            {/* The Tooltip Summary */}
                            <div className="tech-tooltip">
                                {tech.summary[locale]}
                            </div>
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
        .tech-node { background: rgba(22,27,34,0.6); border: 1px solid #30363d; border-radius: 1rem; padding: 1rem 1.5rem; display: flex; align-items: center; gap: 1rem; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); cursor: default; backdrop-filter: blur(10px); position: relative; }
        
        .tech-node:hover { transform: translateY(-3px) scale(1.05); border-color: #8b949e !important; box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important; z-index: 10; background: rgba(33,38,45,0.9); }
        
        .tech-node.faded { opacity: 0.2; filter: grayscale(1); transform: scale(0.95); }
        .tech-node.highlighted { transform: translateY(-2px) scale(1.02); background: rgba(33,38,45,0.8); z-index: 5; }

        .tech-icon { font-size: 1.5rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); }
        .tech-name { color: #e2e8f0; font-weight: 600; font-size: 0.9rem; letter-spacing: 0.5px; }

        .tech-tooltip {
          position: absolute; top: calc(100% + 10px); left: 50%; transform: translateX(-50%) translateY(10px);
          background: rgba(13, 17, 23, 0.95); border: 1px solid #30363d; padding: 0.4rem 0.8rem;
          border-radius: 0.5rem; font-size: 0.75rem; color: #c9d1d9; font-weight: 500;
          white-space: nowrap; opacity: 0; pointer-events: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 10px 25px rgba(0,0,0,0.6);
          z-index: 20; letter-spacing: 0px; text-shadow: none;
        }
        
        /* Subtle triangle pointer */
        .tech-tooltip::before {
          content: ''; position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%);
          border-width: 6px; border-style: solid; border-color: transparent transparent #30363d transparent;
        }

        .tech-node:hover .tech-tooltip { opacity: 1; transform: translateX(-50%) translateY(0); }

        @media (max-width: 768px) {
          .tech-canvas-container { padding: 1.5rem; }
          .cat-btn { padding: 0.4rem 0.8rem; font-size: 0.75rem; }
          .tech-node { padding: 0.8rem 1rem; }
          .tech-tooltip { display: none; /* Hide tooltip on small mobile devices to avoid overflow */ }
        }
      `}</style>
        </div>
    );
}
