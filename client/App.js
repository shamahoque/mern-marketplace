import React from 'react'
import MainRouter from './MainRouter'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@material-ui/styles'
import theme from './theme'
import { hot } from 'react-hot-loader'

import Watchlist from './pages/Watchlist'

const App = () => {
  // Remove server-side injected CSS (Material-UI)
  React.useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side')
    if (jssStyles) {
      jssStyles.parentNode.removeChild(jssStyles)
    }
  }, [])

  
  const user = {
    token: localStorage.getItem('token') || ''
    
  }

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <Routes>
          {/* Existing MainRouter routes */}
          <Route path="/*" element={<MainRouter />} />

          {}
          <Route path="/watchlist" element={<Watchlist user={user} />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default hot(module)(App)
