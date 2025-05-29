import React, { useState, useRef } from 'react';
import RdkitMol from './components/RdkitMol'; // Импорт нового компонента

const Search = () => {
  const [smiles, setSmiles] = useState('');
  const [compound, setCompound] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const cache = useRef({});

  // Простая валидация SMILES (без RDKit)
  const isValidSmiles = (smiles) => {
    // Базовые проверки
    if (!smiles.trim()) return false;
    if (smiles.length < 2) return false;
    
    // Проверка допустимых символов
    const validChars = /^[a-zA-Z0-9@+\-\[\]\(\)\\\/%=#$.]+$/;
    return validChars.test(smiles);
  };

  const handleSearch = async () => {
    if (!smiles.trim()) {
      setError('Введите SMILES');
      return;
    }

    if (!isValidSmiles(smiles)) {
      setError('Невалидный формат SMILES');
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Ошибка сервера');
      }

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
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', marginBottom: '15px' }}>
        <input
          type="text"
          value={smiles}
          onChange={(e) => setSmiles(e.target.value)}
          placeholder="Введите SMILES (например: C1CCCCC1)"
          disabled={isLoading}
          style={{ 
            flex: 1, 
            padding: '10px', 
            fontSize: '16px',
            marginRight: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
        <button
          onClick={handleSearch}
          disabled={isLoading || !smiles.trim()}
          style={{ 
            padding: '10px 15px', 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '5px'
          }}
        >
          {isLoading ? 'Поиск...' : 'Поиск'}
        </button>
        <button
          onClick={() => setSmiles('')}
          disabled={isLoading}
          style={{ 
            padding: '10px 15px', 
            backgroundColor: '#f44336', 
            color: 'white', 
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Очистить
        </button>
      </div>

      {error && (
        <div style={{ 
          color: '#721c24', 
          backgroundColor: '#f8d7da',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '15px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}
      
      {isLoading && (
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <p>Загрузка данных...</p>
        </div>
      )}

      {compound && (
        <div style={{ 
          marginTop: '20px', 
          padding: '20px', 
          border: '1px solid #ddd', 
          borderRadius: '8px',
          backgroundColor: '#f9f9f9'
        }}>
          <h2 style={{ marginTop: 0 }}>
            {compound.formula} 
            {compound.name && <span style={{ fontWeight: 'normal' }}> ({compound.name})</span>}
          </h2>
          
          <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
            <RdkitMol
              smiles={compound.smiles}
              width={300}
              height={300}
            />
          </div>
          
          <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '5px' }}>
            <p><strong>Молекулярная масса:</strong> {compound.molecular_weight?.toFixed(2)}</p>
            {compound.inchi && <p><strong>InChI:</strong> <code>{compound.inchi}</code></p>}
            {compound.description && <p><strong>Описание:</strong> {compound.description}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;