import SwapChart from '../SwapChart'
import { CSSTransition } from 'react-transition-group'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  conversionRate,
  retrieveChart,
  selectSwap,
  showChart,
  SHOW_CHART_KEY,
} from '../../redux/reducers/swap'
import { useEffect } from 'react'
import { OrderBook } from '@lab49/react-order-book'
import { poolGraphData } from '../Chart/Graph.types'
import Chart from '../Chart'
import { LimitOrders } from '../LimitOrders/LimitOrders'

import styles from './index.module.scss'
import { useTonClient } from '../../hook/useTonClient'

const MainPanel = () => {
  const chartdata = poolGraphData()
  console.log('chardata: ')
  const swapState = useAppSelector(selectSwap)
  const dispatch = useAppDispatch()
  const book = {
    asks: [
      ['1.01', '2'],
      ['1.02', '3'],
    ],
    bids: [
      ['0.99', '5'],
      ['0.98', '3'],
    ],
  }

  const client = useTonClient()

  useEffect(() => {
    if (swapState.from != null && swapState.to != null && client) {
      // dispatch(
      //   retrieveChart({
      //     client,
      //     address1: swapState.from.address,
      //     address2: swapState.to.address,
      //     interval: swapState.timespan,
      //   })
      // );
      // dispatch(conversionRate(
      //     { from: swapState.from, to:swapState.to }
      // ));
    }
    const cookieValue = window.localStorage.getItem(SHOW_CHART_KEY) === 'true'
    if (cookieValue) {
      dispatch(showChart(swapState.from !== null && swapState.to !== null))
    }
  }, [swapState.from, swapState.to, dispatch, swapState.timespan, client])

  return (
    <div className='flex flex-col gap-2 lg:flex-row'>
      <div className='bg-[#191a33] border-2 border-[#2B2649] py-5 px-7 p-3 rounded-md'>
        <LimitOrders />
      </div>

      <div className=' bg-[#130F25] border-2 border-[#2B2649] py-5 px-7 rounded-md'>
        <h2>Order Book</h2>
        <hr className=' text-[#2B2649] bg-[#2B2649] mt-2 mb-5' />
        <OrderBook book={book} />
      </div>
    </div>
  )
}

export default MainPanel
