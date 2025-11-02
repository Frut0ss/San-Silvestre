export const metadata = {
  title: 'San Silvestre Training - Elisa',
  description: 'Entrenamiento para San Silvestre Murcia 6.5km',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#9333ea',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}