import { Link } from 'react-router-dom'
import MainPanel from './MainPanel'
import ExchangeHeader from './ExchangeHeader'
import PoolList from './PoolList'
import { LimitOrders } from '../LimitOrders/LimitOrders'
import { OrderPanel } from './OrderPanel'
import LimitOrderPanel from './LimitOrderPanel'

export const Exchange = () => {
  return (
    <div className='py-20 flex flex-col gap-2'>
      {/* <div className="px-3 gap-4 flex py-5 items-center">
        <Link to="/swap" className=" text-btn_color hover:text-white text-lg">
          Swap
        </Link>
        /
        <Link
          to="/liquidity"
          className="text-btn_color hover:text-white text-lg"
        >
          Liquidity
        </Link>
      </div>
      <ExchangeHeader />
      <MainPanel /> */}
      <div className='flex flex-col xl:flex-row'>
        <OrderPanel />
        <LimitOrderPanel />
      </div>
      {/* <MainPanel /> */}
      <PoolList />
      {/* <h2>In Progress</h2> */}
    </div>
  )
}
