import '@/style/reset.css'
import '@/style/globals.css'
import React from 'react'
import { ThemeModeScript } from 'flowbite-react'

export const metadata = {
  title: 'quick send',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='zh-CN' translate='no'>
      <head>
        <ThemeModeScript />
      </head>
      <body>{children}</body>
    </html>
  )
}
