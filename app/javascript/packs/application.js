// Main application entry point
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider } from 'antd'
import 'antd/dist/reset.css'

// Import main App component
import App from '../../views/components/App'

// Theme configuration for Ant Design - using default colors
const theme = {
  token: {
    fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  },
  components: {
    Card: {
      borderRadius: 16,
      boxShadow: '0 8px 32px rgba(22, 119, 255, 0.08)' // Using default primary color shadow
    }
  }
}

// Render function
const renderApp = () => {
  const root = document.getElementById('app-root')
  if (root) {
    const reactRoot = ReactDOM.createRoot(root)
    reactRoot.render(
      <ConfigProvider theme={theme}>
        <App />
      </ConfigProvider>
    )
  }
}

// Initialize React SPA
document.addEventListener('DOMContentLoaded', renderApp)

// Hot Module Replacement support
if (module.hot) {
  module.hot.accept('../../views/components/App', renderApp)
}
