import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { ClerkProviderWrapper } from "./lib/clerkClient.jsx"

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ClerkProviderWrapper>
        <App />
      </ClerkProviderWrapper>
    </BrowserRouter>
  </React.StrictMode>,
)
