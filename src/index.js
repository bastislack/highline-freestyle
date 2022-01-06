import './global.scss';
import 'bootstrap/dist/js/bootstrap.js';
import "bootstrap-icons/font/bootstrap-icons.css";
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import ReactPWAInstallProvider from 'react-pwa-install';
import registerServiceWorker from './serviceWorkerRegistration';
import './index.css';



ReactDOM.render(
  <React.StrictMode>
    <ReactPWAInstallProvider enableLogging>
      <App />
    </ReactPWAInstallProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

registerServiceWorker();
