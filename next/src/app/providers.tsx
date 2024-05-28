"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { State, WagmiProvider } from "wagmi";

import { ChakraProvider } from "@chakra-ui/react";

import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider,darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { optimism, avalancheFuji } from "wagmi/chains";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { fonts } from "./fonts";

import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config = getDefaultConfig({
  appName: "My RainbowKit App",
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID ? process.env.NEXT_PUBLIC_WC_PROJECT_ID : "",
  chains: [optimism],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

type Props = {
  children: ReactNode,
  initialState: State | undefined, 
}


// 2. Add your color mode config
const config1: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
}

// 3. extend the theme
const theme = extendTheme({ config1 })



export function Providers({ children, initialState }: Props){
  const [queryClient] = useState(() => new QueryClient());
  

  return (
    <ChakraProvider theme={theme}>
     <WagmiProvider config={config} initialState={initialState}> 
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider theme={lightTheme({
          })}>{children}</RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ChakraProvider>
  );
}
