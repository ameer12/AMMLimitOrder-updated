import './index.css'
import './App.css'
import { useEffect } from 'react'
import {
  Route,
  Routes,
  BrowserRouter as Router,
  Navigate,
} from 'react-router-dom'
import { Exchange } from './components/Exchange/Exchange'
import { LandingPage } from './components/LandingPage/LandingPage'
import { Header } from './components/Header/Header'
import { Footer } from './components/Footer/Footer'
import { config } from 'dotenv'
import { useAppDispatch, useAppSelector } from './redux/hooks'
import { retrieveTokens } from './redux/reducers/tokens'
import { selectAccount } from './redux/reducers/account'
import Modals from './components/Modals'
import { SwapPanel } from './components/Exchange/SwapPanel'
import LiquidityPage from './components/LiquidityPage'
import Pool from './components/Exchange/Pool'
config()

function App() {
  const { walletAddress } = useAppSelector(selectAccount)
  console.log('wallet_address;', walletAddress)
  const dispatch = useAppDispatch()

  useEffect(() => {
    const fetchTokens = async () => {
      const tokens = await retrieveTokens(walletAddress)
      dispatch(tokens)
    }
    fetchTokens()
  }, [dispatch, walletAddress])

  return (
    <>
      <div className='App'>
        <Header />
        <div className='bg-dark pt-20 min-h-screen w-full'>
          <Routes>
            {/* <Route path="/" element={<LandingPage />} /> */}
            <Route path='/exchange/:token1/:token2' element={<Pool />} />
            <Route path='/exchange' element={<Exchange />} />
            <Route path='/swap' element={<SwapPanel />} />
            <Route path='/liquidity' element={<LiquidityPage />} />
            <Route path='*' element={<Navigate to='/exchange' replace />} />
          </Routes>
          <Modals />
        </div>
      </div>
    </>
  )
}

export default App;
