import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// Dev: expose post-image quality store in console (getPostImageRecords(), exportPostImageRecordsJson())
if (import.meta.env.DEV) {
  import('./utils/postImageCheckStore').then((m) => {
    window.getPostImageRecords = m.getPostImageRecords
    window.exportPostImageRecordsJson = m.exportPostImageRecordsJson
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
