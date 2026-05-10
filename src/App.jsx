import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import CookieConsent from "@/components/CookieConsent"

const queryClient = new QueryClient()

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Pages />
        <Toaster />
        <CookieConsent />
      </QueryClientProvider>
    </HelmetProvider>
  )
}

export default App