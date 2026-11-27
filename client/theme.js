import { createMuiTheme } from '@material-ui/core/styles'
import { blueGrey, lightGreen } from '@material-ui/core/colors'

const theme = createMuiTheme({
    palette: {
      primary: {
      light: '#8eacbb',
      main: '#607d8b',
      dark: '#34515e',
      contrastText: '#fff',
    },
    secondary: {
      light: '#e7ff8c',
      main: '#b2ff59',
      dark: '#7ecb20',
      contrastText: '#000',
    },
      openTitle: blueGrey['400'],
      protectedTitle: lightGreen['400'],
      type: 'light',
      // D-13: colours that several components used to repeat as literals.
      navigation: {
        active: '#bef67a',
        inactive: '#ffffff'
      },
      marketplace: {
        priceText: '#375a53',
        priceBackground: '#93c5ae3d',
        amount: 'rgb(72, 175, 148)',
        total: 'rgb(53, 97, 85)',
        shopName: '#78948f',
        subheading: 'rgba(88, 114, 128, 0.87)',
        subheadingLight: 'rgba(88, 114, 128, 0.67)',
        panelBackground: '#f8f8f8'
      }
    }
  })

  export default theme
