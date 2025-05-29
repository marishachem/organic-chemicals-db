import React, { useEffect, useRef } from 'react';

const RdkitMol = ({ smiles, width = 300, height = 300 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Динамическая загрузка RDKit из CDN
    const loadRDKit = async () => {
      if (!window.RDKit) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/@rdkit/rdkit/dist/RDKit_minimal.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });
        
        // Инициализация RDKit
        await window.RDKitModule.init();
      }

      drawMolecule();
    };

    const drawMolecule = () => {
      if (!window.RDKit || !smiles || !canvasRef.current) return;

      try {
        const mol = window.RDKit.get_mol(smiles);
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, width, height);
        mol.draw_to_canvas(canvasRef.current, width, height);
        mol.delete();
      } catch (error) {
        console.error('Error drawing molecule:', error);
      }
    };

    loadRDKit();
  }, [smiles, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} />;
};

export default RdkitMol;