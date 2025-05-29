import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Search from './search';

// Инициализация RDKit
window.initRDKit = new Promise((resolve) => {
  window.initRDKitModule = () => {
    resolve(window.RDKit);
    console.log('RDKit initialized');
  };
  
  if (window.RDKitModule) {
    window.RDKitModule.init().then(window.initRDKitModule);
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Search />
  </React.StrictMode>
);