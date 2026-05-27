import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navbar } from '@/components/Navbar'
import { Hero } from '@/components/Hero'
import { LogoBar } from '@/components/LogoBar'
import { HowItWorks } from '@/components/HowItWorks'
import { Features } from '@/components/Features'
import { Testimonials } from '@/components/Testimonials'
import { Pricing } from '@/components/Pricing'
import { CTA } from '@/components/CTA'
import { Footer } from '@/components/Footer'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import DashboardPage from '@/pages/DashboardPage'

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <LogoBar />
        <HowItWorks />
        <Features />
        <Testimonials />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  )
}
