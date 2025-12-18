import { TokenBalanced } from '../redux/types/tokens'
import { delay } from './util'

const TOKEN_PER_PAGE = 20

export interface Token {
  name: string
  symbol: string
  address: string
  chainId: number
  decimals: number
  logoURI: string
}

export const getTokenInfo = async (masterAddress: string) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_TONAPI_URL}/jettons/${masterAddress}`
    )
    const data = await response.json()

    const token: TokenBalanced = {
      address: data.metadata.address,
      name: data.metadata.name,
      symbol: data.metadata.symbol,
      decimals: data.metadata.decimals,
      logoURI: data.metadata.image,
      chainId: 0,
    }

    return token
  } catch (err) {
    console.log(err)
    return null
  }
}

export const listTokens = async (page: number): Promise<Token[]> => {
  await delay(100)
  let offset = page === -1 ? 0 : page * TOKEN_PER_PAGE
  let count = page === -1 ? _tokens.length : TOKEN_PER_PAGE
  return _tokens.slice(offset).slice(0, count)
}

export const tokenInfo = async (
  address: string
): Promise<Token | undefined> => {
  await delay(100)
  return _tokens.find((token) => token.address === address) ?? undefined
}

export const usdtBalance = async (tokenAddress: string): Promise<number> => {
  await delay(1000)
  const response = await fetch(
    `${
      import.meta.env.VITE_TONAPI_URL
    }/rates?tokens=${tokenAddress}&currencies=ton%2Cusd`
  )
  const data = await response.json()
  console.log('response====>', data)
  return 0
}

// Here we can get specific token balance in user wallet.
export const tokenBalance = async (
  token: TokenBalanced,
  address: string
): Promise<number> => {
  const response = await fetch(
    `${import.meta.env.VITE_TONAPI_URL}/accounts/${address}/jettons`
  )
  const data = await response.json()
  const matchingBalances = data.balances.filter(
    (balance: { jetton: { symbol: any } }) =>
      balance.jetton.symbol === token?.symbol
  )
  if (matchingBalances.length == 0) return 0
  return matchingBalances[0].balance / 10 ** token.decimals
}

export const jettonList = async (address: string) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_TONAPI_URL}/accounts/${address}/jettons`
    )
    const data = await response.json()
    if (data.balances && data.balances.length) return data.balances
    else return []
  } catch (err) {
    console.log('gettting jetton list from tonapi: ', err)
    return []
  }
}

export const Test_1 = {
  name: 'Test 1',
  symbol: 'TEST_1',
  address: 'EQC-lfJSxg024GbTik2H51ioTSLT7WaJTYEogfI6Cz0kOOGL',
  chainId: 0,
  decimals: 9,
  logoURI: 'https://static.ston.fi/logo/ton_symbol.png',
}

export const Test_2 = {
  name: 'Test 2',
  // symbol: "AMBR",
  symbol: 'TEST_2',
  address: 'EQDN0CtaoPu1Oo00L4HVOU6enq0khYyZmCWSWnpGvzZCrEKV',
  chainId: 0,
  decimals: 9,
  logoURI: 'https://static.ston.fi/logo/ton_symbol.png',
}

export const TON = {
  name: 'Test 2',
  symbol: 'TEST_2',
  address: 'EQDgxEYJuTTF8Xs9zb51D-LR0h5IhZ0HPiyQ6_WM2VwyYS6a',
  chainId: 0,
  decimals: 9,
  logoURI: 'https://static.ston.fi/logo/ton_symbol.png',
}

export const Ambra = {
  name: 'Test 3',
  // symbol: "AMBR",
  symbol: 'TEST_3',
  address: 'EQA5i_aM4WbI9p6eDvGbtvZ91B0vSIllWwY9m7oajyu_yqT2',
  chainId: 0,
  decimals: 9,
  logoURI:
    'https://cache.tonapi.io/imgproxy/OMf5ls1dS1LDBSVOnqcQs0DfhjYWlyEOk8Y7vnvP4sQ/rs:fill:200:200:1/g:no/aXBmczovL2JhZnliZWljc3Zvem50cDVpYXR3YWQzMnFndmlzanhzaG9wNjJlcndvaGFxbmFqZ3Nta2w3N2I2dWg0.webp',
}
export const USDT = {
  name: 'jUSDT',
  symbol: 'jUSDT',
  address: 'EQBynBO23ywHy_CgarY9NK9FTz0yDsG82PtcbSTQgGoXwiuA',
  chainId: 0,
  decimals: 6,
  logoURI:
    'https://cache.tonapi.io/imgproxy/cUNZUfLE-OYozhOKWNw7HHINxER0pQnXhhtUkMQYWck/rs:fill:200:200:1/g:no/aHR0cHM6Ly9icmlkZ2UudG9uLm9yZy90b2tlbi8xLzB4ZGFjMTdmOTU4ZDJlZTUyM2EyMjA2MjA2OTk0NTk3YzEzZDgzMWVjNy5wbmc.webp',
}

export const _tokens: Token[] = [
  Test_1,
  Test_2,
  // TON,
  // Ambra,
  // {
  //   name: "GAGARIN",
  //   symbol: "GGR",
  //   address: "EQDetcmWrfHLPRPVh3LoFvwso0zsjFnpmmXTKWj7s1ycNgu2",
  //   chainId: 0,
  //   decimals: 18,
  //   logoURI:
  //     "https://cache.tonapi.io/imgproxy/Wx2s0WP_hKeyW2zSs6jL0lGrzBOSEVIhAskr1J7vZdg/rs:fill:200:200:1/g:no/aHR0cHM6Ly9nYWdhcmluLndvcmxkL2dnci1sb2dvLnBuZw.webp",
  // },
  // {
  //   name: "TAN Token",
  //   symbol: "TAN",
  //   address: "EQBPL2ZXLh4dMtIHjxh7EXGVYH-8_Uz3km4QIOkT8KbqeezG",
  //   chainId: 0,
  //   decimals: 9,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0xa1faa113cbE53436Df28FF0aEe54275c13B40975.png",
  // },
  // {
  //   name: "Alex Token",
  //   symbol: "ALEX",
  //   address: "EQCh9T3qJgmjVwlyKCo5LXgG0ooJwfLvf4ybL4GN-y006z_o",
  //   chainId: 0,
  //   decimals: 9,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
  // },
  // {
  //   name: "EasyCash",
  //   symbol: "Easy",
  //   address: "EQDwLXgx-5vKSAFjLWz6_rocruC9siIJW01lFVCfyWkFS-_6",
  //   chainId: 0,
  //   decimals: 9,
  //   logoURI:
  //     "https://raw.githubusercontent.com/777warden777/EasyCash/main/IMG-20221017-WA0111.jpg",
  // },
  // {
  //   name: "Fanzee Token",
  //   symbol: "FNZ",
  //   address: "EQDCJL0iQHofcBBvFBHdVG233Ri2V4kCNFgfRT-gqAd3Oc86",
  //   chainId: 0,
  //   decimals: 9,
  //   logoURI:
  //     "https://cache.tonapi.io/imgproxy/2JucCf-fnxN0vPIEYj-CzE-FhU6WsCq4nsuke0dQzUM/rs:fill:200:200:1/g:no/aHR0cHM6Ly9tZWRpYS5mYW56LmVlL2ltYWdlcy85MWVlOTM4YTkyOTM0NjU2YTAxMTMxYzU2OWIzNzdiNi5wbmc.webp",
  // },
  // {
  //   name: "jUSDT",
  //   symbol: "jUSDT",
  //   address: "EQBynBO23ywHy_CgarY9NK9FTz0yDsG82PtcbSTQgGoXwiuA",
  //   chainId: 0,
  //   decimals: 6,
  //   logoURI:
  //     "https://cache.tonapi.io/imgproxy/cUNZUfLE-OYozhOKWNw7HHINxER0pQnXhhtUkMQYWck/rs:fill:200:200:1/g:no/aHR0cHM6Ly9icmlkZ2UudG9uLm9yZy90b2tlbi8xLzB4ZGFjMTdmOTU4ZDJlZTUyM2EyMjA2MjA2OTk0NTk3YzEzZDgzMWVjNy5wbmc.webp",
  // },
  // {
  //   name: "Huebel Bolt",
  //   symbol: "BOLT",
  //   address: "EQD0vdSA_NedR9uvbgN9EikRX-suesDxGeFg69XQMavfLqIw",
  //   chainId: 0,
  //   decimals: 9,
  //   logoURI:
  //     "https://cache.tonapi.io/imgproxy/vPhDv8TBUkDFE5N74ckFuSE2FtKKjmNpL4B-Ti3gd5Q/rs:fill:200:200:1/g:no/aHR0cHM6Ly9jbG91ZGZsYXJlLWlwZnMuY29tL2lwZnMvUW1YNDdkb2RVZzFhY1hveFlEVUxXVE5mU2hYUlc1dUhyQ21vS1NVTlI5eEtRdw.webp",
  // },
  // {
  //   name: "jUSDC",
  //   symbol: "jUSDC",
  //   address: "EQB-MPwrd1G6WKNkLz_VnV6WqBDd142KMQv-g1O-8QUA3728",
  //   chainId: 0,
  //   decimals: 6,
  //   logoURI:
  //     "https://cache.tonapi.io/imgproxy/UymsjyiaxqixpFtKcLIkuLOaW9HtAPPK7cXbBq51JaQ/rs:fill:200:200:1/g:no/aHR0cHM6Ly9icmlkZ2UudG9uLm9yZy90b2tlbi8xLzB4YTBiODY5OTFjNjIxOGIzNmMxZDE5ZDRhMmU5ZWIwY2UzNjA2ZWI0OC5wbmc.webp",
  // },
  // {
  //   name: "WTON",
  //   symbol: "WTON",
  //   address: "EQDQoc5M3Bh8eWFephi9bClhevelbZZvWhkqdo80XuY_0qXv",
  //   chainId: 0,
  //   decimals: 9,
  //   logoURI:
  //     "https://cache.tonapi.io/imgproxy/j5Y4dB2qIK3d0qQuGWCiJzdPfybLhb5ef3hyO3lcYHk/rs:fill:200:200:1/g:no/aHR0cHM6Ly9zdC50b25veC5vcmcvd3Rvbi5wbmc.webp",
  // },
  // {
  //   name: "Orbit Bridge Ton Orbs",
  //   symbol: "oORBS",
  //   address: "EQAwr5lcbQcLKTAg_SQ-dpKWNQZpO1MGnrAs53bf1gkKTVHx",
  //   chainId: 0,
  //   decimals: 18,
  //   logoURI:
  //     "https://cache.tonapi.io/imgproxy/bHaZIEyvfgXvVubw0ELciAan54xYl51TaVyKNZFfnzw/rs:fill:200:200:1/g:no/aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL29yYml0LWNoYWluL2JyaWRnZS10b2tlbi1pbWFnZS9tYWluL3Rvbi9vcmJzLnBuZw.webp",
  // },
  // {
  //   name: "Orbit Bridge Ton Ethererum",
  //   symbol: "oETH",
  //   address: "EQAW42HutyDem98Be1f27PoXobghh81umTQ-cGgaKVmRLS7-",
  //   chainId: 0,
  //   decimals: 18,
  //   logoURI:
  //     "https://cache.tonapi.io/imgproxy/LdMkc6GbVvywDO4tLlniOF5rNCF66dlyXV6NDFy_0-Q/rs:fill:200:200:1/g:no/aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL29yYml0LWNoYWluL2JyaWRnZS10b2tlbi1pbWFnZS9tYWluL3Rvbi9ldGgucG5n.webp",
  // },
  // {
  //   name: "Orbit Bridge Ton USD Tether",
  //   symbol: "oUSDT",
  //   address: "EQC_1YoM8RBixN95lz7odcF3Vrkc_N8Ne7gQi7Abtlet_Efi",
  //   chainId: 0,
  //   decimals: 6,
  //   logoURI:
  //     "https://cache.tonapi.io/imgproxy/kaZxRk-VPWO4yy6CUe2bKH7bN6v7FUw6FZ7epjCff4U/rs:fill:200:200:1/g:no/aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL29yYml0LWNoYWluL2JyaWRnZS10b2tlbi1pbWFnZS9tYWluL3Rvbi91c2R0LnBuZw.webp",
  // },

  // {
  //   name: "Cardano Token",
  //   symbol: "ADA",
  //   address: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47.png",
  // },
  // {
  //   name: "AlphaToken",
  //   symbol: "ALPHA",
  //   address: "0xa1faa113cbE53436Df28FF0aEe54275c13B40975",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0xa1faa113cbE53436Df28FF0aEe54275c13B40975.png",
  // },
  // {
  //   name: "Altura",
  //   symbol: "ALU",
  //   address: "0x8263CD1601FE73C066bf49cc09841f35348e3be0",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0x8263CD1601FE73C066bf49cc09841f35348e3be0/logo.png",
  // },
  // {
  //   name: "Automata",
  //   symbol: "ATA",
  //   address: "0xA2120b9e674d3fC3875f415A7DF52e382F141225",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0xA2120b9e674d3fC3875f415A7DF52e382F141225.png",
  // },
  // {
  //   name: "Cosmos Token",
  //   symbol: "ATOM",
  //   address: "0x0Eb3a705fc54725037CC9e008bDede697f62F335",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0x0Eb3a705fc54725037CC9e008bDede697f62F335.png",
  // },
  // {
  //   name: "Baby Doge Coin",
  //   symbol: "BABYDOGE",
  //   address: "0xc748673057861a797275CD8A068AbB95A902e8de",
  //   chainId: 56,
  //   decimals: 9,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0xc748673057861a797275CD8A068AbB95A902e8de/logo.png",
  // },
  // {
  //   name: "Bear",
  //   symbol: "BEAR",
  //   address: "0xc3EAE9b061Aa0e1B9BD3436080Dc57D2d63FEdc1",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0xc3EAE9b061Aa0e1B9BD3436080Dc57D2d63FEdc1/logo.png",
  // },
  // {
  //   name: "Bella Protocol",
  //   symbol: "BEL",
  //   address: "0x8443f091997f06a61670B735ED92734F5628692F",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0x8443f091997f06a61670B735ED92734F5628692F.png",
  // },
  // {
  //   name: "BELT Token",
  //   symbol: "BELT",
  //   address: "0xE0e514c71282b6f4e823703a39374Cf58dc3eA4f",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0xE0e514c71282b6f4e823703a39374Cf58dc3eA4f.png",
  // },
  // {
  //   name: "Binemon",
  //   symbol: "BIN",
  //   address: "0xe56842Ed550Ff2794F010738554db45E60730371",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0xe56842Ed550Ff2794F010738554db45E60730371/logo.png",
  // },
  // {
  //   name: "Binamon",
  //   symbol: "BMON",
  //   address: "0x08ba0619b1e7A582E0BCe5BBE9843322C954C340",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0x08ba0619b1e7A582E0BCe5BBE9843322C954C340.png",
  // },
  // {
  //   name: "BunnyPark",
  //   symbol: "BP",
  //   address: "0xACB8f52DC63BB752a51186D1c55868ADbFfEe9C1",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0xACB8f52DC63BB752a51186D1c55868ADbFfEe9C1.png",
  // },
  // {
  //   name: "BSCPAD.com",
  //   symbol: "BSCPAD",
  //   address: "0x5A3010d4d8D3B5fB49f8B6E57FB9E48063f16700",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0x5A3010d4d8D3B5fB49f8B6E57FB9E48063f16700.png",
  // },
  // {
  //   name: "BitTorrent",
  //   symbol: "BTT",
  //   address: "0x8595F9dA7b868b1822194fAEd312235E43007b49",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0x8595F9dA7b868b1822194fAEd312235E43007b49.png",
  // },
  // {
  //   name: "Coin98",
  //   symbol: "C98",
  //   address: "0xaEC945e04baF28b135Fa7c640f624f8D90F1C3a6",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0xaEC945e04baF28b135Fa7c640f624f8D90F1C3a6.png",
  // },
  // {
  //   name: "CryptoCars",
  //   symbol: "CCAR",
  //   address: "0x50332bdca94673F33401776365b66CC4e81aC81d",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0x50332bdca94673F33401776365b66CC4e81aC81d/logo.png",
  // },
  // {
  //   name: "Chess",
  //   symbol: "CHESS",
  //   address: "0x20de22029ab63cf9A7Cf5fEB2b737Ca1eE4c82A6",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0x20de22029ab63cf9A7Cf5fEB2b737Ca1eE4c82A6.png",
  // },
  // {
  //   name: "Chroma",
  //   symbol: "CHR",
  //   address: "0xf9CeC8d50f6c8ad3Fb6dcCEC577e05aA32B224FE",
  //   chainId: 56,
  //   decimals: 6,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0xf9CeC8d50f6c8ad3Fb6dcCEC577e05aA32B224FE.png",
  // },
  // {
  //   name: "CP",
  //   symbol: "CP",
  //   address: "0x82C19905B036bf4E329740989DCF6aE441AE26c1",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0x82C19905B036bf4E329740989DCF6aE441AE26c1/logo.png",
  // },
  // {
  //   name: "DeRace Token",
  //   symbol: "DERC",
  //   address: "0x373E768f79c820aA441540d254dCA6d045c6d25b",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0x373E768f79c820aA441540d254dCA6d045c6d25b/logo.png",
  // },
  // {
  //   name: "DODO bird",
  //   symbol: "DODO",
  //   address: "0x67ee3Cb086F8a16f34beE3ca72FAD36F7Db929e2",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0x67ee3Cb086F8a16f34beE3ca72FAD36F7Db929e2.png",
  // },
  // {
  //   name: "Dogecoin",
  //   symbol: "DOGE",
  //   address: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43",
  //   chainId: 56,
  //   decimals: 8,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0xbA2aE424d960c26247Dd6c32edC70B295c744C43.png",
  // },
  // {
  //   name: "My DeFi Pet Token",
  //   symbol: "DPET",
  //   address: "0xfb62AE373acA027177D1c18Ee0862817f9080d08",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0xfb62AE373acA027177D1c18Ee0862817f9080d08/logo.png",
  // },
  // {
  //   name: "DeathRoad Token",
  //   symbol: "DRACE",
  //   address: "0xA6c897CaaCA3Db7fD6e2D2cE1a00744f40aB87Bb",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0xA6c897CaaCA3Db7fD6e2D2cE1a00744f40aB87Bb/logo.png",
  // },
  // {
  //   name: "DragonSlayer",
  //   symbol: "DRS",
  //   address: "0xc8E8ecB2A5B5d1eCFf007BF74d15A86434aA0c5C",
  //   chainId: 56,
  //   decimals: 9,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0xc8E8ecB2A5B5d1eCFf007BF74d15A86434aA0c5C/logo.png",
  // },
  // {
  //   name: "Dvision",
  //   symbol: "DVI",
  //   address: "0x758FB037A375F17c7e195CC634D77dA4F554255B",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0x758FB037A375F17c7e195CC634D77dA4F554255B.png",
  // },
  // {
  //   name: "Etherconnect Coin",
  //   symbol: "ECC",
  //   address: "0x8D047F4F57A190C96c8b9704B39A1379E999D82B",
  //   chainId: 56,
  //   decimals: 8,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0x8D047F4F57A190C96c8b9704B39A1379E999D82B/logo.png",
  // },
  // {
  //   name: "Ellipsis",
  //   symbol: "EPS",
  //   address: "0xA7f552078dcC247C2684336020c03648500C6d9F",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0xA7f552078dcC247C2684336020c03648500C6d9F.png",
  // },
  // {
  //   name: "FaraCrystal",
  //   symbol: "FARA",
  //   address: "0xF4Ed363144981D3A65f42e7D0DC54FF9EEf559A1",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0xF4Ed363144981D3A65f42e7D0DC54FF9EEf559A1/logo.png",
  // },
  // {
  //   name: "FLOKI",
  //   symbol: "FLOKI",
  //   address: "0x2B3F34e9D4b127797CE6244Ea341a83733ddd6E4",
  //   chainId: 56,
  //   decimals: 9,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0x2B3F34e9D4b127797CE6244Ea341a83733ddd6E4/logo.png",
  // },
  // {
  //   name: "Formation Finance",
  //   symbol: "FORM",
  //   address: "0x25A528af62e56512A19ce8c3cAB427807c28CC19",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0x25A528af62e56512A19ce8c3cAB427807c28CC19.png",
  // },
  // {
  //   name: "Frontier Token",
  //   symbol: "FRONT",
  //   address: "0x928e55daB735aa8260AF3cEDadA18B5f70C72f1b",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0x928e55daB735aa8260AF3cEDadA18B5f70C72f1b.png",
  // },
  // {
  //   name: "CyberDragon Gold",
  //   symbol: "GOLD",
  //   address: "0xb3a6381070B1a15169DEA646166EC0699fDAeA79",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0xb3a6381070B1a15169DEA646166EC0699fDAeA79/logo.png",
  // },
  // {
  //   name: "StepHero",
  //   symbol: "HERO",
  //   address: "0xE8176d414560cFE1Bf82Fd73B986823B89E4F545",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0xE8176d414560cFE1Bf82Fd73B986823B89E4F545.png",
  // },
  // {
  //   name: "Metahero",
  //   symbol: "HERO",
  //   address: "0xD40bEDb44C081D2935eebA6eF5a3c8A31A1bBE13",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0xD40bEDb44C081D2935eebA6eF5a3c8A31A1bBE13.png",
  // },
  // {
  //   name: "Honey token",
  //   symbol: "HONEY",
  //   address: "0xFa363022816aBf82f18a9C2809dCd2BB393F6AC5",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0xFa363022816aBf82f18a9C2809dCd2BB393F6AC5/logo.png",
  // },
  // {
  //   name: "Hunny Token",
  //   symbol: "HUNNY",
  //   address: "0x565b72163f17849832A692A3c5928cc502f46D69",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0x565b72163f17849832A692A3c5928cc502f46D69/logo.png",
  // },
  // {
  //   name: "Injective Protocol",
  //   symbol: "INJ",
  //   address: "0xa2B726B1145A4773F68593CF171187d8EBe4d495",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0xa2B726B1145A4773F68593CF171187d8EBe4d495.png",
  // },
  // {
  //   name: "IoTeX Network",
  //   symbol: "IOTX",
  //   address: "0x9678E42ceBEb63F23197D726B29b1CB20d0064E5",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0x9678E42ceBEb63F23197D726B29b1CB20d0064E5.png",
  // },
  // {
  //   name: "ITAM",
  //   symbol: "ITAM",
  //   address: "0x04C747b40Be4D535fC83D09939fb0f626F32800B",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0x04C747b40Be4D535fC83D09939fb0f626F32800B.png",
  // },
  // {
  //   name: "Kaby Arena",
  //   symbol: "KABY",
  //   address: "0x02A40C048eE2607B5f5606e445CFc3633Fb20b58",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0x02A40C048eE2607B5f5606e445CFc3633Fb20b58/logo.png",
  // },
  // {
  //   name: "KmonCoin",
  //   symbol: "KMON",
  //   address: "0xc732B6586A93b6B7CF5FeD3470808Bc74998224D",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0xc732B6586A93b6B7CF5FeD3470808Bc74998224D/logo.png",
  // },
  // {
  //   name: "Linear Token",
  //   symbol: "LINA",
  //   address: "0x762539b45A1dCcE3D36d080F74d1AED37844b878",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0x762539b45A1dCcE3D36d080F74d1AED37844b878.png",
  // },
  // {
  //   name: "ChainLink Token",
  //   symbol: "LINK",
  //   address: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD.png",
  // },
  // {
  //   name: "Mask Network",
  //   symbol: "MASK",
  //   address: "0x2eD9a5C8C13b93955103B9a7C167B67Ef4d568a3",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0x2eD9a5C8C13b93955103B9a7C167B67Ef4d568a3.png",
  // },
  // {
  //   name: "Mobox",
  //   symbol: "MBOX",
  //   address: "0x3203c9E46cA618C8C1cE5dC67e7e9D75f5da2377",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0x3203c9E46cA618C8C1cE5dC67e7e9D75f5da2377.png",
  // },
  // {
  //   name: "MiniFootball",
  //   symbol: "MINIFOOTBALL",
  //   address: "0xD024Ac1195762F6F13f8CfDF3cdd2c97b33B248b",
  //   chainId: 56,
  //   decimals: 9,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0xD024Ac1195762F6F13f8CfDF3cdd2c97b33B248b/logo.png",
  // },
  // {
  //   name: "Mist",
  //   symbol: "MIST",
  //   address: "0x68E374F856bF25468D365E539b700b648Bf94B67",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0x68E374F856bF25468D365E539b700b648Bf94B67/logo.png",
  // },
  // {
  //   name: "Mound Token",
  //   symbol: "MND",
  //   address: "0x4c97c901B5147F8C1C7Ce3c5cF3eB83B44F244fE",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0x4c97c901B5147F8C1C7Ce3c5cF3eB83B44F244fE/logo.png",
  // },
  // {
  //   name: "Monsta Infinite Token",
  //   symbol: "MONI",
  //   address: "0x9573c88aE3e37508f87649f87c4dd5373C9F31e0",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0x9573c88aE3e37508f87649f87c4dd5373C9F31e0/logo.png",
  // },
  // {
  //   name: "Nafter",
  //   symbol: "NAFT",
  //   address: "0xD7730681B1DC8f6F969166B29D8A5EA8568616a3",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0xD7730681B1DC8f6F969166B29D8A5EA8568616a3/logo.png",
  // },
  // {
  //   name: "Nobility",
  //   symbol: "NBL",
  //   address: "0xA67a13c9283Da5AABB199Da54a9Cb4cD8B9b16bA",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0xA67a13c9283Da5AABB199Da54a9Cb4cD8B9b16bA/logo.png",
  // },
  // {
  //   name: "NFTB",
  //   symbol: "NFTB",
  //   address: "0xde3dbBE30cfa9F437b293294d1fD64B26045C71A",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0xde3dbBE30cfa9F437b293294d1fD64B26045C71A/logo.png",
  // },
  // {
  //   name: "Nerve",
  //   symbol: "NRV",
  //   address: "0x42F6f551ae042cBe50C739158b4f0CAC0Edb9096",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0x42F6f551ae042cBe50C739158b4f0CAC0Edb9096.png",
  // },
  // {
  //   name: "Harmony ONE",
  //   symbol: "ONE",
  //   address: "0x03fF0ff224f904be3118461335064bB48Df47938",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0x03fF0ff224f904be3118461335064bB48Df47938.png",
  // },
  // {
  //   name: "PAID Network",
  //   symbol: "PAID",
  //   address: "0xAD86d0E9764ba90DDD68747D64BFfBd79879a238",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0xAD86d0E9764ba90DDD68747D64BFfBd79879a238/logo.png",
  // },
  // {
  //   name: "PET GAMES",
  //   symbol: "PETG",
  //   address: "0x09607078980CbB0665ABa9c6D1B84b8eAD246aA0",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0x09607078980CbB0665ABa9c6D1B84b8eAD246aA0/logo.png",
  // },
  // {
  //   name: "Pink Token",
  //   symbol: "PINK",
  //   address: "0x9133049Fb1FdDC110c92BF5b7Df635abB70C89DC",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0x9133049Fb1FdDC110c92BF5b7Df635abB70C89DC/logo.png",
  // },
  // {
  //   name: "Polkamon",
  //   symbol: "PMON",
  //   address: "0x1796ae0b0fa4862485106a0de9b654eFE301D0b2",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0x1796ae0b0fa4862485106a0de9b654eFE301D0b2.png",
  // },
  // {
  //   name: "Poco Token",
  //   symbol: "POCO",
  //   address: "0x394bBA8F309f3462b31238B3fd04b83F71A98848",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0x394bBA8F309f3462b31238B3fd04b83F71A98848/logo.png",
  // },
  // {
  //   name: "Moonpot",
  //   symbol: "POTS",
  //   address: "0x3Fcca8648651E5b974DD6d3e50F61567779772A8",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0x3Fcca8648651E5b974DD6d3e50F61567779772A8.png",
  // },
  // {
  //   name: "Plant vs Undead Token",
  //   symbol: "PVU",
  //   address: "0x31471E0791fCdbE82fbF4C44943255e923F1b794",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0x31471E0791fCdbE82fbF4C44943255e923F1b794/logo.png",
  // },
  // {
  //   name: "PandaInu Wallet Token",
  //   symbol: "PWT",
  //   address: "0xf3eDD4f14a018df4b6f02Bf1b2cF17A8120519A2",
  //   chainId: 56,
  //   decimals: 8,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0xf3eDD4f14a018df4b6f02Bf1b2cF17A8120519A2/logo.png",
  // },
  // {
  //   name: "Qubit Token",
  //   symbol: "QBT",
  //   address: "0x17B7163cf1Dbd286E262ddc68b553D899B93f526",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0x17B7163cf1Dbd286E262ddc68b553D899B93f526.png",
  // },
  // {
  //   name: "Radio Caca V2",
  //   symbol: "RACA",
  //   address: "0x12BB890508c125661E03b09EC06E404bc9289040",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0x12BB890508c125661E03b09EC06E404bc9289040/logo.png",
  // },
  // {
  //   name: "RAMP DEFI",
  //   symbol: "RAMP",
  //   address: "0x8519EA49c997f50cefFa444d240fB655e89248Aa",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0x8519EA49c997f50cefFa444d240fB655e89248Aa.png",
  // },
  // {
  //   name: "Reef.finance",
  //   symbol: "REEF",
  //   address: "0xF21768cCBC73Ea5B6fd3C687208a7c2def2d966e",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0xF21768cCBC73Ea5B6fd3C687208a7c2def2d966e.png",
  // },
  // {
  //   name: "rUSD",
  //   symbol: "RUSD",
  //   address: "0x07663837218A003e66310a01596af4bf4e44623D",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0x07663837218A003e66310a01596af4bf4e44623D.png",
  // },
  // {
  //   name: "SafePal Token",
  //   symbol: "SFP",
  //   address: "0xD41FDb03Ba84762dD66a0af1a6C8540FF1ba5dfb",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0xD41FDb03Ba84762dD66a0af1a6C8540FF1ba5dfb.png",
  // },
  // {
  //   name: "SeedifyFund",
  //   symbol: "SFUND",
  //   address: "0x477bC8d23c634C154061869478bce96BE6045D12",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0x477bC8d23c634C154061869478bce96BE6045D12.png",
  // },
  // {
  //   name: "Shirtum",
  //   symbol: "SHI",
  //   address: "0x7269d98Af4aA705e0B1A5D8512FadB4d45817d5a",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0x7269d98Af4aA705e0B1A5D8512FadB4d45817d5a/logo.png",
  // },
  // {
  //   name: "CryptoBlades Skill Token",
  //   symbol: "SKILL",
  //   address: "0x154A9F9cbd3449AD22FDaE23044319D6eF2a1Fab",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0x154A9F9cbd3449AD22FDaE23044319D6eF2a1Fab.png",
  // },
  // {
  //   name: "StarMon",
  //   symbol: "SMON",
  //   address: "0xAB15B79880f11cFfb58dB25eC2bc39d28c4d80d2",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0xAB15B79880f11cFfb58dB25eC2bc39d28c4d80d2/logo.png",
  // },
  // {
  //   name: "Splintershards",
  //   symbol: "SPS",
  //   address: "0x1633b7157e7638C4d6593436111Bf125Ee74703F",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0x1633b7157e7638C4d6593436111Bf125Ee74703F.png",
  // },
  // {
  //   name: "SushiToken",
  //   symbol: "SUSHI",
  //   address: "0x947950BcC74888a40Ffa2593C5798F11Fc9124C4",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0x947950BcC74888a40Ffa2593C5798F11Fc9124C4.png",
  // },
  // {
  //   name: "Swipe",
  //   symbol: "SXP",
  //   address: "0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A.png",
  // },
  // {
  //   name: "Tokocrypto Token",
  //   symbol: "TKO",
  //   address: "0x9f589e3eabe42ebC94A44727b3f3531C0c877809",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0x9f589e3eabe42ebC94A44727b3f3531C0c877809.png",
  // },
  // {
  //   name: "Alien Worlds Trilium",
  //   symbol: "TLM",
  //   address: "0x2222227E22102Fe3322098e4CBfE18cFebD57c95",
  //   chainId: 56,
  //   decimals: 4,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0x2222227E22102Fe3322098e4CBfE18cFebD57c95.png",
  // },
  // {
  //   name: "TokenPocket Token",
  //   symbol: "TPT",
  //   address: "0xECa41281c24451168a37211F0bc2b8645AF45092",
  //   chainId: 56,
  //   decimals: 4,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0xECa41281c24451168a37211F0bc2b8645AF45092.png",
  // },
  // {
  //   name: "TRONPAD.network",
  //   symbol: "TRONPAD",
  //   address: "0x1Bf7AedeC439D6BFE38f8f9b20CF3dc99e3571C4",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0x1Bf7AedeC439D6BFE38f8f9b20CF3dc99e3571C4/logo.png",
  // },
  // {
  //   name: "TRON",
  //   symbol: "TRX",
  //   address: "0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B.png",
  // },
  // {
  //   name: "TrusterCoin",
  //   symbol: "TSC",
  //   address: "0xA2a26349448ddAfAe34949a6Cc2cEcF78c0497aC",
  //   chainId: 56,
  //   decimals: 9,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0xA2a26349448ddAfAe34949a6Cc2cEcF78c0497aC/logo.png",
  // },
  // {
  //   name: "TrueUSD",
  //   symbol: "TUSD",
  //   address: "0x14016E85a25aeb13065688cAFB43044C2ef86784",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0x14016E85a25aeb13065688cAFB43044C2ef86784.png",
  // },
  // {
  //   name: "Trust Wallet",
  //   symbol: "TWT",
  //   address: "0x4B0F1812e5Df2A09796481Ff14017e6005508003",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0x4B0F1812e5Df2A09796481Ff14017e6005508003.png",
  // },
  // {
  //   name: "UNCL on xDai on BSC",
  //   symbol: "UNCL",
  //   address: "0x0E8D5504bF54D9E44260f8d153EcD5412130CaBb",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0x0E8D5504bF54D9E44260f8d153EcD5412130CaBb/logo.png",
  // },
  // {
  //   name: "UniCrypt on xDai on BSC",
  //   symbol: "UNCX",
  //   address: "0x09a6c44c3947B69E2B45F4D51b67E6a39ACfB506",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0x09a6c44c3947B69E2B45F4D51b67E6a39ACfB506/logo.png",
  // },
  // {
  //   name: "Uniswap",
  //   symbol: "UNI",
  //   address: "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0xBf5140A22578168FD562DCcF235E5D43A02ce9B1.png",
  // },
  // {
  //   name: "Wrapped UST Token",
  //   symbol: "UST",
  //   address: "0x23396cF899Ca06c4472205fC903bDB4de249D6fC",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0x23396cF899Ca06c4472205fC903bDB4de249D6fC.png",
  // },
  // {
  //   name: "VAI Stablecoin",
  //   symbol: "VAI",
  //   address: "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7.png",
  // },
  // {
  //   name: "Wanaka Farm",
  //   symbol: "WANA",
  //   address: "0x339C72829AB7DD45C3C52f965E7ABe358dd8761E",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0x339C72829AB7DD45C3C52f965E7ABe358dd8761E/logo.png",
  // },
  // {
  //   name: "WEYU",
  //   symbol: "WEYU",
  //   address: "0xFAfD4CB703B25CB22f43D017e7e0d75FEBc26743",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0xFAfD4CB703B25CB22f43D017e7e0d75FEBc26743/logo.png",
  // },
  // {
  //   name: "WINk",
  //   symbol: "WIN",
  //   address: "0xaeF0d72a118ce24feE3cD1d43d383897D05B4e99",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0xaeF0d72a118ce24feE3cD1d43d383897D05B4e99.png",
  // },
  // {
  //   name: "XRP Token",
  //   symbol: "XRP",
  //   address: "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://tokens.pancakeswap.finance/images/0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE.png",
  // },
  // {
  //   name: "XWG",
  //   symbol: "XWG",
  //   address: "0x6b23C89196DeB721e6Fd9726E6C76E4810a464bc",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0x6b23C89196DeB721e6Fd9726E6C76E4810a464bc/logo.png",
  // },
  // {
  //   name: "YAY Games",
  //   symbol: "YAY",
  //   address: "0x524dF384BFFB18C0C8f3f43d012011F8F9795579",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0x524dF384BFFB18C0C8f3f43d012011F8F9795579/logo.png",
  // },
  // {
  //   name: "ZomaInfinity",
  //   symbol: "ZIN",
  //   address: "0xFbe0b4aE6E5a200c36A341299604D5f71A5F0a48",
  //   chainId: 56,
  //   decimals: 18,
  //   logoURI:
  //     "https://assets.trustwalletapp.com/blockchains/smartchain/assets/0xFbe0b4aE6E5a200c36A341299604D5f71A5F0a48/logo.png",
  // },
]
