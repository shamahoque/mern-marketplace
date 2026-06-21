import React from 'react'
import MainRouter from './MainRouter'
import {BrowserRouter} from 'react-router-dom'
import { ThemeProvider } from '@material-ui/styles'
import getTheme from './theme'
import { hot } from 'react-hot-loader'

const App = () => {
  React.useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side')
    if (jssStyles) {
      jssStyles.parentNode.removeChild(jssStyles)
    }
  }, [])

  const [darkMode, setDarkMode] = React.useState(false)
  const theme = getTheme(darkMode)

  return (
  <BrowserRouter>
      <ThemeProvider theme={theme}>
        <MainRouter
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      </ThemeProvider>
  </BrowserRouter>
)}

export default hot(module)(App)
