import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Matchly AI | #1 AI Resume Parser & ATS Optimization Tool",
  description: "Boost your interview chances with Matchly AI. The superior AI resume parser that analyzes your CV against job descriptions, provides ATS scores, identifying keywords gaps, and offers actionable optimization tips. Free to use.",
  applicationName: 'Matchly AI',
  authors: [{ name: 'Bharath Kumar K', url: 'https://github.com/Bharath-Kumar-K-0930' }],
  generator: 'Next.js',
  keywords: [
    'Matchly AI',
    'Resume Parser',
    'ATS Checker',
    'AI Resume Scorer',
    'Job Match',
    'Resume Optimization',
    'CV Analysis',
    'Career Tools',
    'Bharath Kumar K',
    'Free Resume Review'
  ],
  referrer: 'origin-when-cross-origin',
  creator: 'Bharath Kumar K',
  publisher: 'Matchly AI',
  metadataBase: new URL('https://matchly-ai.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Matchly AI - Optimize Your Resume to Beat the ATS',
    description: 'Stop getting rejected by bots. Matchly AI compares your resume against job descriptions to give you a real match score and expert fix-it advice.',
    url: 'https://matchly-ai.vercel.app',
    siteName: 'Matchly AI',
    images: [
      {
        url: '/logo.png', // Ideally this should be a large OG Image (1200x630)
        width: 800,
        height: 600,
        alt: 'Matchly AI Dashboard Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Matchly AI - AI Powered Resume Optimization',
    description: 'Get your resume ranked #1. AI-driven scoring and gap analysis.',
    images: ['/logo.png'], // Reusing logo for now, strictly should be wide image
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code', // User would need to replace this
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
