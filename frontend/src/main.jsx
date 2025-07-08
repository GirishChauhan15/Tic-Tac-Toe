import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {ToastContainer} from 'react-toastify'

import {disableReactDevTools} from '@fvilers/disable-react-devtools'

if (import.meta.env.VITE_NODE_ENV === 'production') {
  disableReactDevTools();
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <ToastContainer position='bottom-right' />
  </StrictMode>,
)
