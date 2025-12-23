'use client';

import { useMemo } from 'react';

interface SimpleBackgroundProps {
  variant?: 'gradient' | 'dots' | 'grid' | 'particles';
  className?: string;
}

/**
 * Lekka alternatywa dla Vanta - CSS-only backgrounds
 * Idealne dla stron gdzie Vanta jest overkill
 */
export default function SimpleBackground({ 
  variant = 'gradient', 
  className = 'absolute inset-0 -z-10' 
}: SimpleBackgroundProps) {
  
  const backgroundStyle = useMemo(() => {
    switch (variant) {
      case 'gradient':
        return {
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradient 15s ease infinite',
        };
      
      case 'dots':
        return {
          background: '#000000',
          backgroundImage: 
            'radial-gradient(circle, rgba(184, 134, 11, 0.1) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        };
      
      case 'grid':
        return {
          background: '#000000',
          backgroundImage: `
            linear-gradient(rgba(184, 134, 11, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(184, 134, 11, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        };
      
      case 'particles':
        return {
          background: 'radial-gradient(ellipse at center, #1a1a1a 0%, #000000 100%)',
        };
      
      default:
        return { background: '#000000' };
    }
  }, [variant]);

  return (
    <>
      <div 
        className={`${className} pointer-events-none`}
        style={backgroundStyle}
      />
      {variant === 'gradient' && (
        <style jsx>{`
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
      )}
    </>
  );
}
