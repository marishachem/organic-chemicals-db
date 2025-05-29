import React, { useEffect, useRef, useState } from 'react';
import { initRDKitModule } from '@rdkit/rdkit';

// Глобальный объект для кеширования RDKit
let rdkitModuleGlobal = null;

const RdkitMol = ({ smiles, width = 300, height = 300 }) => {
  const canvasRef = useRef(null);
  const [rdkitLoaded, setRdkitLoaded] = useState(false);

  // Загрузка RDKit при монтировании компонента
  useEffect(() => {
    let isMounted = true;
    
    const loadRDKit = async () => {
      try {
        // Если RDKit уже загружен глобально
        if (rdkitModuleGlobal) {
          setRdkitLoaded(true);
          return;
        }

        // Инициализируем RDKit
        const module = await initRDKitModule();
        if (isMounted) {
          rdkitModuleGlobal = module;
          setRdkitLoaded(true);
        }
      } catch (error) {
        console.error('Error loading RDKit:', error);
      }
    };

    loadRDKit();

    return () => {
      isMounted = false;
    };
  }, []);

  // Отрисовка молекулы при изменении параметров
  useEffect(() => {
    if (!rdkitLoaded || !smiles || !canvasRef.current) return;

    try {
      // Создаем молекулу из SMILES
      const mol = rdkitModuleGlobal.get_mol(smiles);
      
      // Очищаем canvas перед отрисовкой
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, width, height);
      
      // Отрисовываем молекулу
      mol.draw_to_canvas(canvasRef.current, width, height);
      mol.delete(); // Важно: освобождаем память
    } catch (error) {
      console.error('Error drawing molecule:', error);
    }
  }, [smiles, width, height, rdkitLoaded]);

  return <canvas ref={canvasRef} width={width} height={height} />;
};

export default RdkitMol;