// UI フォントをセルフホストで配信する（styles/*.css.ts で使う weight のみ読み込む）
import '@fontsource/m-plus-2/400.css';
import '@fontsource/m-plus-2/600.css';
import '@fontsource/m-plus-2/700.css';
import '@fontsource/m-plus-2/800.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
