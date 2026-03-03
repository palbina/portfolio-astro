/** @jsxImportSource react */
import React, { useState } from 'react';
import SplineIsland from './SplineIsland';

const scenes = [
    { id: 'a', name: 'Concept A', scene: 'https://prod.spline.design/XFgTeIbAEJdSOU3x/scene.splinecode', badgeText: 'Alpha Engine' },
    { id: 'b', name: 'Concept B', scene: 'https://prod.spline.design/NHgXR6kv9RmwC2x1/scene.splinecode', badgeText: 'Experimental UI' },
    { id: 'c', name: 'Concept C', scene: 'https://prod.spline.design/esf6payoGqJdygPR/scene.splinecode', badgeText: 'Cyber Architecture' },
    { id: 'd', name: 'Concept D', scene: 'https://prod.spline.design/47MZ6kLFaxA8MIY1/scene.splinecode', badgeText: 'Core Engine' },
    { id: 'e', name: 'Concept E', scene: 'https://prod.spline.design/NI0sFe0J09VQIAZX/scene.splinecode', badgeText: 'Neural Flow' }
];

export default function SplineShowcase() {
    const [activeId, setActiveId] = useState(scenes[0].id);

    const activeScene = scenes.find((s) => s.id === activeId) || scenes[0];

    return (
        <div className="spline-showcase-container">
            <style>{`
                .spline-showcase-container {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    width: 100%;
                }
                .spline-tabs {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    padding: 0.5rem;
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 1rem;
                    justify-content: center;
                    backdrop-filter: blur(10px);
                }
                .spline-tab {
                    padding: 0.6rem 1.25rem;
                    border-radius: 0.75rem;
                    border: 1px solid transparent;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 0.85rem;
                    font-weight: 600;
                    letter-spacing: 0.05em;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .spline-tab:hover {
                    color: rgba(255, 255, 255, 0.9);
                    background: rgba(255, 255, 255, 0.05);
                }
                .spline-tab.active {
                    background: rgba(34, 211, 238, 0.15);
                    border-color: rgba(34, 211, 238, 0.3);
                    color: #22d3ee;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(34, 211, 238, 0.15);
                }
            `}</style>

            {/* Navegación por Pestañas */}
            <div className="spline-tabs" role="tablist">
                {scenes.map((s) => (
                    <button
                        key={s.id}
                        role="tab"
                        aria-selected={activeId === s.id}
                        className={`spline-tab ${activeId === s.id ? 'active' : ''}`}
                        onClick={() => setActiveId(s.id)}
                    >
                        {s.name}
                    </button>
                ))}
            </div>

            {/* Contenedor de la Isla (Al usar la prop key React forzará un desmontaje/montaje limpio 
                restableciendo todo el estado de Carga de cada modelo independientemente) */}
            <div className="spline-content animate-fade-in">
                <SplineIsland
                    key={activeScene.id}
                    scene={activeScene.scene}
                    badgeText={activeScene.badgeText}
                />
            </div>
        </div>
    );
}
