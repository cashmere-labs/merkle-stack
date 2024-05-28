import { 
    createConfig, 
    http, 
    cookieStorage,
    createStorage 
  } from 'wagmi'
  import { avalancheFuji, mainnet, sepolia } from 'wagmi/chains'
  
  export const config = createConfig({
    chains: [mainnet, sepolia,avalancheFuji],
    ssr: true,
    storage: createStorage({  
      storage: cookieStorage, 
    }),  
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
      [avalancheFuji.id]: http(),
    },
  })