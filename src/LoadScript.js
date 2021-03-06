import { Component } from 'react'
import { injectScript } from './utils/injectscript'
import { LoadScriptPropTypes } from './proptypes'
import { preventGoogleFonts } from './utils/prevent-google-fonts'

class LoadScript extends Component {
  static propTypes = LoadScriptPropTypes
  static defaultProps = {
    onLoad: () => {},
    onError: () => {}
  }

  state = {
    loaded: false
  }

  componentDidMount = () => {
    const {
      id,
      googleMapsApiKey,
      language,
      region,
      version,
      libraries,
      preventGoogleFontsLoading
    } = this.props

    if (preventGoogleFontsLoading) {
      preventGoogleFonts()
    }

    injectScript({
      id,
      url: `https://maps.googleapis.com/maps/api/js?v=${version}&key=${googleMapsApiKey}&language=${language}&region=${region}${
        libraries ? `&libraries=${libraries.join(',')}` : ''
      }`,
      onSuccess: () => {
        this.props.onLoad()

        this.setState(
          () => ({
            loaded: true
          })
        )
      },
      onError: () => {
        throw new Error(`
There has been an Error with loading Google Maps API script, please check that you provided all required props to <LoadScript />
Props you have provided:

googleMapsApiKey: ${this.props.googleMapsApiKey}
language: ${this.props.language}
region: ${this.props.region}
version: ${this.props.version}
libraries: ${(this.props.libraries || []).join(',')}

Otherwise it is a Network issues.
`)
      }
    })
  }

  componentWillUnmount = () => {
    const script = document.getElementById(this.props.id)

    script.parentNode.removeChild(script)

    Array.prototype.slice
      .call(document.getElementsByTagName('script'))
      .filter(script => script.src.includes('maps.googleapis'))
      .forEach(script => {
        script.parentNode.removeChild(script)
      })

    Array.prototype.slice
      .call(document.getElementsByTagName('link'))
      .filter(
        link =>
          link.href === 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Google+Sans'
      )
      .forEach(link => {
        link.parentNode.removeChild(link)
      })

    Array.prototype.slice
      .call(document.getElementsByTagName('style'))
      .filter(style => style.innerText.includes('.gm-'))
      .forEach(style => {
        style.parentNode.removeChild(style)
      })

    delete window.google.maps.version
  }

  render = () => (this.state.loaded ? this.props.children : this.props.loadingElement)
}

export default LoadScript
