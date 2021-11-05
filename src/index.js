import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './serviceWorkerRegistration';
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';


ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

registerServiceWorker();
