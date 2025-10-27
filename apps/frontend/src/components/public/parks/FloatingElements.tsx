'use client';

import { useState, useEffect } from 'react';
import { Leaf, Mountain, Trees, Bird, Flower } from 'lucide-react';

interface FloatingElementProps {
  icon: React.ComponentType<{ className?: string }>;
  size: number;
  position: { top: number; left: number };
  speed: number;
  delay?: number;
  color?: string;
}

function FloatingElement({ 
  icon: Icon, 
  size, 
  position, 
  speed, 
  delay = 0,
  color = 'text-white/10'
}: FloatingElementProps) {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    
    // Delay visibility for staggered animation
    const timer = setTimeout(() => setIsVisible(true), delay);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, [delay]);

  return (
    <div
      className={`absolute transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{
        top: `${position.top}%`,
        left: `${position.left}%`,
        transform: `translateY(${scrollY * speed}px)`,
      }}
    >
      <Icon 
        className={`${color} transition-all duration-500 hover:scale-110`}
      />
    </div>
  );
}

export function FloatingElements() {
  const elements = [
    // Trees
    { icon: Trees, size: 64, position: { top: 15, left: 8 }, speed: 0.3, delay: 0, color: 'text-emerald-200/20' },
    { icon: Trees, size: 48, position: { top: 25, left: 85 }, speed: 0.2, delay: 200, color: 'text-green-200/15' },
    { icon: Trees, size: 56, position: { top: 60, left: 12 }, speed: 0.4, delay: 400, color: 'text-teal-200/20' },
    
    // Mountains
    { icon: Mountain, size: 80, position: { top: 20, left: 75 }, speed: 0.1, delay: 100, color: 'text-slate-200/15' },
    { icon: Mountain, size: 60, position: { top: 45, left: 5 }, speed: 0.25, delay: 300, color: 'text-gray-200/10' },
    
    // Leaves
    { icon: Leaf, size: 32, position: { top: 30, left: 20 }, speed: 0.5, delay: 150, color: 'text-green-300/25' },
    { icon: Leaf, size: 24, position: { top: 70, left: 80 }, speed: 0.35, delay: 350, color: 'text-emerald-300/20' },
    { icon: Leaf, size: 28, position: { top: 50, left: 60 }, speed: 0.45, delay: 250, color: 'text-teal-300/25' },
    
    // Birds
    { icon: Bird, size: 20, position: { top: 25, left: 50 }, speed: 0.6, delay: 500, color: 'text-white/15' },
    { icon: Bird, size: 16, position: { top: 40, left: 70 }, speed: 0.4, delay: 600, color: 'text-white/10' },
    
    // Flowers
    { icon: Flower, size: 36, position: { top: 65, left: 25 }, speed: 0.3, delay: 700, color: 'text-pink-200/20' },
    { icon: Flower, size: 28, position: { top: 35, left: 90 }, speed: 0.4, delay: 800, color: 'text-purple-200/15' },
  ];

  return (
    <>
      {elements.map((element, index) => (
        <FloatingElement
          key={index}
          icon={element.icon}
          size={element.size}
          position={element.position}
          speed={element.speed}
          delay={element.delay}
          color={element.color}
        />
      ))}
    </>
  );
}
