import './globals.css'

export const metadata = {
  title: 'Meeting Notes Generator',
  description: 'Transform transcripts into professional summaries',
}

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>
}
