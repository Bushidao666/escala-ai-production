"use client";

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/shared/lib/utils';

// Definindo a tipagem para as propriedades CSS customizadas
interface CustomCSSProperties extends React.CSSProperties {
  '--duration'?: string;
  '--delay'?: string;
  '--size'?: string;
  '--drift'?: string;
  '--x'?: string;
  '--y'?: string;
  '--pulse-delay'?: string;
}

// Componente para partículas de mana aprimoradas
const ManaParticle = ({ index, type }: { index: number; type: 'energy' | 'data' | 'spark' }) => {
  const [style, setStyle] = useState<CustomCSSProperties>({});

  useEffect(() => {
    const duration = 8 + Math.random() * 12;
    const delay = Math.random() * 20;
    const size = type === 'energy' ? 2 + Math.random() * 3 : 
                 type === 'data' ? 1 + Math.random() * 2 : 
                 0.5 + Math.random() * 1.5;
    const left = Math.random() * 100;
    const drift = (Math.random() - 0.5) * 30;

    setStyle({
      '--duration': `${duration}s`,
      '--delay': `-${delay}s`,
      '--size': `${size}px`,
      '--drift': `${drift}px`,
      left: `${left}%`,
    });
  }, [type]); // Empty dependency array ensures this runs only once on the client

  return <div className={`mana-particle mana-particle--${type}`} style={style}></div>;
};



// Componente para nodos neurais
const NeuralNode = ({ index }: { index: number }) => {
  const [style, setStyle] = useState<CustomCSSProperties>({});

  useEffect(() => {
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const size = 0.5 + Math.random() * 1.5;
    const pulseDelay = Math.random() * 10;

    setStyle({
      '--x': `${x}%`,
      '--y': `${y}%`,
      '--size': `${size}px`,
      '--pulse-delay': `${pulseDelay}s`,
    });
  }, []); // Empty dependency array ensures this runs only once on the client

  return <div className="neural-node" style={style}></div>;
};

export function AnimatedBackground() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const energyParticles = 12;   // Partículas de energia (verdes brilhantes)
  const dataParticles = 18;     // Partículas de dados (azuis sutis)
  const sparkParticles = 8;     // Faíscas (brancas pequenas)
  const neuralNodes = 15;       // Nodos neurais

  return (
    <div
      id="animated-background"
      className="fixed top-0 left-0 w-full h-full -z-50 overflow-hidden bg-brand-black"
    >
      {/* Camada do Grid Cyberpunk */}
      <div className="cyber-grid-layer"></div>

      {/* Camada de Nodos Neurais (sem linhas) */}
      <div className="neural-layer">
        {isClient && Array.from({ length: neuralNodes }).map((_, i) => (
          <NeuralNode key={`node-${i}`} index={i} />
        ))}
      </div>

      {/* Camada das Partículas de Mana Aprimoradas */}
      <div className="particle-layer">
        {/* Partículas de Energia */}
        {isClient && Array.from({ length: energyParticles }).map((_, i) => (
          <ManaParticle key={`energy-${i}`} index={i} type="energy" />
        ))}
        {/* Partículas de Dados */}
        {isClient && Array.from({ length: dataParticles }).map((_, i) => (
          <ManaParticle key={`data-${i}`} index={i} type="data" />
        ))}
        {/* Faíscas */}
        {isClient && Array.from({ length: sparkParticles }).map((_, i) => (
          <ManaParticle key={`spark-${i}`} index={i} type="spark" />
        ))}
      </div>

      {/* Camada de Pulsos Etéreos */}
      <div className="ethereal-layer"></div>
    </div>
  );
} 