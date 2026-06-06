import React from 'react'
import ReactDOM from 'react-dom/client'
import { StartClient } from '@tanstack/react-start'
import { getRouter } from './router'
import './styles.css'

const router = getRouter()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StartClient router={router} />
  </React.StrictMode>,
)
