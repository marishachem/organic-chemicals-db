import React, { useState, useRef } from 'react';
import { RDKitMolDraw, getRDKitModule } from 'react-rdkit';

const Search = () => {
  const [smiles, setSmiles] = useState('');
  const [compound, setCompound] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const cache = useRef({});

  const isValidSmiles = async (smiles) => {
    try {
      const RDKit = await getRDKitModule();
      const mol = RDKit.get_mol(smiles);
      if (!mol) return false;
      mol.delete();
      return true;
    } catch {
      return false;
    }
  };

  const handleSearch = async () => {
    if (!smiles.trim()) {
      setError('Введите SMILES');
      return;
    }

    if (!(await isValidSmiles(smiles))) {
      setError('Невалидный SMILES');
      return;
    }

    if (cache.current[smiles]) {
      setCompound(cache.current[smiles]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const encodedSmiles = encodeURIComponent(smiles);
      const response = await fetch(
        `http://localhost:8000/compound/?smiles=${encodedSmiles}`
      );

      if (!response.ok) throw new Error('Ошибка сервера');

      const data = await response.json();
      setCompound(data);
      cache.current[smiles] = data;
    } catch (err) {
      setError(err.message || 'Соединение не найдено');
      setCompound(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div>
        <input
          type="text"
          value={smiles}
          onChange={(e) => setSmiles(e.target.value)}
          placeholder="Введите SMILES (например: C1CCCCC1)"
          disabled={isLoading}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <button
          onClick={handleSearch}
          disabled={isLoading || !smiles.trim()}
          style={{ marginRight: '5px' }}
        >
          {isLoading ? 'Поиск...' : 'Поиск'}
        </button>
        <button
          onClick={() => setSmiles('')}
          disabled={isLoading}
        >
          Очистить
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {isLoading && <p>Загрузка данных...</p>}

      {compound && (
        <div style={{ marginTop: '20px' }}>
          <h2>{compound.formula} {compound.name && `(${compound.name})`}</h2>
          <RDKitMolDraw
            smiles={compound.smiles}
            width={300}
            height={300}
          />
          <p><b>Молекулярная масса:</b> {compound.molecular_weight.toFixed(2)}</p>
          {compound.inchi && <p><b>InChI:</b> {compound.inchi}</p>}
          {compound.description && <p><b>Описание:</b> {compound.description}</p>}
        </div>
      )}
    </div>
  );
};

export default Search;