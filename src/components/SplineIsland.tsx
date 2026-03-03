/** @jsxImportSource react */
import React, { useState, useEffect, Suspense } from 'react';

// Cargamos dinámicamente Spline para no romper el SSR de Astro
const Spline = React.lazy(() => import('@splinetool/react-spline'));

interface SplineIslandProps {
    scene: string;
    badgeText?: string;
    clickToInteractText?: string;
}

export default function SplineIsland({
    scene,
    badgeText,
    clickToInteractText
}: SplineIslandProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInteractive, setIsInteractive] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Solo montamos Spline en el cliente (Client-Side Rendering seguro)
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Determina idioma actual en el cliente para traduccion nativa
    const isEs = typeof window !== 'undefined' && window.location.pathname.startsWith('/es');

    const displayBadgeText = badgeText || (isEs ? 'Experiencia 3D' : '3D Component');
    const displayInteractText = clickToInteractText || (isEs ? 'Activar Experiencia' : 'Click to interact');

    return (
        <div
            className={`spline-island-wrapper ${isLoaded ? 'loaded' : 'loading'}`}
            onPointerDown={() => setIsInteractive(true)}
        >
            <style>{`
                .spline-island-wrapper {
                    position: relative;
                    width: 100%;
                    aspect-ratio: 4 / 5;
                    background: rgba(15, 23, 42, 0.4);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border-radius: 2.5rem;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 0 50px -12px rgba(0,0,0,0.5);
                    transition: all 1s ease-in-out;
                }
                .spline-island-wrapper.loading {
                    opacity: 0;
                    transform: scale(0.98);
                }
                .spline-island-wrapper.loaded {
                    opacity: 1;
                    transform: scale(1);
                }
                @media (min-width: 768px) {
                    .spline-island-wrapper {
                        aspect-ratio: 16 / 9;
                    }
                }
                .spline-overlay {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    z-index: 10;
                    background: linear-gradient(to top, rgba(15, 23, 42, 0.8), transparent, rgba(15, 23, 42, 0.2));
                }
                .spline-loader {
                    position: absolute;
                    inset: 0;
                    z-index: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: rgba(15, 23, 42, 0.5);
                    color: rgba(34, 211, 238, 0.8);
                }
                .spline-spinner {
                    width: 3rem;
                    height: 3rem;
                    border: 2px solid transparent;
                    border-top-color: #22d3ee;
                    border-radius: 50%;
                    animation: spline-spin 1s linear infinite;
                    filter: drop-shadow(0 0 15px rgba(34,211,238,0.5));
                }
                @keyframes spline-spin {
                    to { transform: rotate(360deg); }
                }
                .spline-loader-text {
                    margin-top: 1.25rem;
                    font-size: 0.75rem;
                    font-weight: bold;
                    letter-spacing: 0.3em;
                    text-transform: uppercase;
                    font-family: monospace;
                    background: linear-gradient(to right, #22d3ee, #3b82f6);
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .spline-canvas-container {
                    width: 100%;
                    height: 100%;
                    transition: opacity 0.7s ease-in-out;
                }
                .spline-canvas-container.non-interactive {
                    pointer-events: none;
                    opacity: 0.9;
                }
                .spline-interact-shield {
                    position: absolute;
                    inset: 0;
                    z-index: 30;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(0, 0, 0, 0.3);
                    backdrop-filter: blur(2px);
                    -webkit-backdrop-filter: blur(2px);
                    transition: all 0.3s ease;
                    cursor: pointer;
                }
                .spline-interact-shield:hover {
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(4px);
                    -webkit-backdrop-filter: blur(4px);
                }
                .spline-interact-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                    transition: transform 0.3s;
                }
                .spline-interact-shield:hover .spline-interact-content {
                    transform: scale(1.05);
                }
                .spline-interact-icon {
                    width: 3.5rem;
                    height: 3.5rem;
                    border-radius: 50%;
                    background: rgba(34, 211, 238, 0.2);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid rgba(34, 211, 238, 0.3);
                    box-shadow: 0 0 30px rgba(34, 211, 238, 0.2);
                    color: #67e8f9;
                }
                .spline-interact-icon svg {
                    width: 1.5rem;
                    height: 1.5rem;
                    margin-left: 0.25rem;
                }
                .spline-interact-btn {
                    background: rgba(15, 23, 42, 0.9);
                    color: #e0f2fe;
                    padding: 0.6rem 1.5rem;
                    border-radius: 9999px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(34, 211, 238, 0.3);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                }
                .spline-meta-badge {
                    position: absolute;
                    top: 1.5rem;
                    right: 1.5rem;
                    z-index: 20;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.5rem 1rem;
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border-radius: 9999px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    pointer-events: none;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                }
                .spline-meta-dot {
                    width: 0.5rem;
                    height: 0.5rem;
                    border-radius: 50%;
                    animation: spline-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                .spline-meta-dot.interactive {
                    background: #4ade80;
                    box-shadow: 0 0 12px rgba(74,222,128,0.8);
                }
                .spline-meta-dot.locked {
                    background: #22d3ee;
                    box-shadow: 0 0 12px rgba(34,211,238,0.8);
                }
                .spline-meta-text {
                    font-size: 0.6rem;
                    font-weight: bold;
                    color: rgba(255, 255, 255, 0.9);
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                }
                @media (min-width: 640px) {
                    .spline-meta-text { font-size: 0.625rem; }
                }
                @keyframes spline-pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: .5; }
                }
            `}</style>

            {/* Overlay de profundidad */}
            <div className="spline-overlay" />

            {/* Skeleton / Spinner de Carga */}
            {!isLoaded && (
                <div className="spline-loader">
                    <div className="spline-spinner" />
                    <span className="spline-loader-text">
                        {isEs ? 'Inicializando...' : 'Initializing...'}
                    </span>
                </div>
            )}

            <div className={`spline-canvas-container ${!isInteractive && isLoaded ? 'non-interactive' : ''}`}>
                {isMounted && (
                    <Suspense fallback={null}>
                        <Spline
                            scene={scene}
                            onLoad={() => setIsLoaded(true)}
                        />
                    </Suspense>
                )}
            </div>

            {/* Capa Bloqueadora: Haz clic para interactuar */}
            {!isInteractive && isLoaded && (
                <div
                    className="spline-interact-shield"
                    onClick={() => setIsInteractive(true)}
                >
                    <div className="spline-interact-content">
                        <div className="spline-interact-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="spline-interact-btn">
                            {displayInteractText}
                        </span>
                    </div>
                </div>
            )}

            {/* Etiqueta / Metadato dinámico */}
            <div className="spline-meta-badge">
                <div className={`spline-meta-dot ${isInteractive ? 'interactive' : 'locked'}`} />
                <span className="spline-meta-text">
                    {displayBadgeText}
                </span>
            </div>
        </div>
    );
}
