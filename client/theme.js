import { createMuiTheme } from '@material-ui/core/styles'
import { blueGrey, lightGreen } from '@material-ui/core/colors'

const getTheme = (darkMode) =>
  createMuiTheme({
    palette: {
      type: darkMode ? 'dark' : 'light',

      primary: {
        light: '#8eacbb',
        main: '#607d8b',
        dark: '#34515e',
        contrastText: '#fff'
      },

      secondary: {
        light: '#e7ff8c',
        main: '#b2ff59',
        dark: '#7ecb20',
        contrastText: '#000'
      },

      background: {
        default: darkMode ? '#121212' : '#fafafa',
        paper: darkMode ? '#1e1e1e' : '#ffffff'
      },

      openTitle: blueGrey['400'],
      protectedTitle: lightGreen['400']
    }
  })

export default getTheme