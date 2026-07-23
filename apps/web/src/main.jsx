import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import './design-system/styles/tokens.css'
import './design-system/styles/theme.light.css'
import './design-system/styles/theme.pink-moon.css'
import './design-system/styles/globals.css'
import './design-system/styles/utilities.css'
import './index.css'

import App from './App.jsx'
import DesignSystemProvider from './components/DesignSystemProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <DesignSystemProvider>
        <App />
      </DesignSystemProvider>
    </BrowserRouter>
  </StrictMode>,
)
