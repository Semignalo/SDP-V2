import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { CartProvider } from './contexts/CartContext';
import { AppearanceProvider } from './contexts/AppearanceContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppearanceProvider>
      <CartProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </CartProvider>
    </AppearanceProvider>
  </StrictMode>,
)
