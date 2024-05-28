import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { type ReactNode } from 'react'
import { fonts } from './fonts'
import { headers } from 'next/headers' 
import { cookieToInitialState } from 'wagmi' 

import { config } from './config'

import { Providers } from './providers'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GoatPoint Cashmere',
  description: 'GoatPoint Drop from Cashmere',

  metadataBase: new URL(`https://points.cashmere.exchange/`)
}

export default function RootLayout(props: { children: ReactNode }) {
  const initialState = cookieToInitialState( 
    config, 
    headers().get('cookie') 
  ) 
  return (
    <html lang="en" className={fonts.rubik.className}>
      <body className={fonts.rubik.className}>
        <Providers initialState={initialState} >{props.children}</Providers>
      </body>
    </html>
  )
}
