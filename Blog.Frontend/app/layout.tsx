import type { Metadata } from 'next'
import { Space_Grotesk, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ParticleBackground } from '@/components/particle-background'
import { AuthProvider } from '@/context/auth-context'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'SIV - Semillero de Investigación en Videojuegos y Gamificación',
  description: 'Semillero de investigación en videojuegos y gamificación de la UTP. Exploramos las infinitas posibilidades que ofrecen los videojuegos y la gamificación.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${spaceGrotesk.variable} ${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <ParticleBackground />
          <div className="relative z-10">
            <Navbar />
            <main>{children}</main>
            <Footer />
          </div>
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  )
}
