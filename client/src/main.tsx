import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ApiClientProvider } from '@/contexts/apiClientContext'
import '@/index.css'
import App from '@/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApiClientProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ApiClientProvider>
  </StrictMode>,
)
