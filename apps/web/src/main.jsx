import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import './design-system/styles/tokens.css'
import './design-system/styles/theme.light.css'
import './design-system/styles/theme.pink-moon.css'
import './design-system/styles/globals.css'
import './design-system/styles/utilities.css'
// Package component CSS (SUG-224 Phase 4) — required for any component consumed
// as a re-export from @sugartown/design-system (its JSX references classnames
// hashed by the package's own build, not Vite's). Harmless no-op for
// components not yet converted: their web copy still imports its own local
// .module.css with a different hash, and validate:style-mirror keeps the two
// byte-identical, so this bundle's rules for those selectors are just unused.
import '@sugartown/design-system/styles.css'
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
