import '../styles/globals.css'
import { AuthProvider } from '../utils/auth'
import { ThemeProvider } from '../utils/theme'
import Layout from '../components/Layout'

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default MyApp