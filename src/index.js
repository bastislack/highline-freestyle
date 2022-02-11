import './global.scss';
import 'bootstrap/dist/js/bootstrap.js';
import "bootstrap-icons/font/bootstrap-icons.css";
import React from 'react';
import ReactDOM from 'react-dom';
import LocalizedApp from './LocalizedApp';
import ReactPWAInstallProvider from 'react-pwa-install';
import registerServiceWorker from './serviceWorkerRegistration';
import './index.css';



ReactDOM.render(
  <React.StrictMode>
    <ReactPWAInstallProvider enableLogging>
      <LocalizedApp />
    </ReactPWAInstallProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

registerServiceWorker();
