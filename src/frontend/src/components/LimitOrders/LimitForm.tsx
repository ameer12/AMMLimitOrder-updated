import { useState, useEffect } from 'react'
import { PlusSmallIcon, MinusSmallIcon } from '@heroicons/react/24/solid'
import { TonConnectButton } from '@tonconnect/ui-react'
import { SubmitOrderData } from '../../action/LimitOrderAction'
import axios from 'axios'

import './limit_order.scss'

export default function LimitForm() {
  const [tokenValue, setTokenValue] = useState<number>(0)
  const [fromAmount, setfromAmount] = useState<number>(0)
  const [totalAmount, setTotalAmount] = useState<number>(0)

  useEffect(() => {
    fetchData()
    setTotalAmount(tokenValue * fromAmount)
  }, [tokenValue, fromAmount])

  const fetchData = async () => {
    console.log('loaded')
    const result = await axios.get(
      `https://pro-api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=1h&locale=en&x_cg_pro_api_key=CG-cYLMAXA7qqWnK5RXS8WAw5Jk`
    )
    console.log(result.data)
    // setCoinLists(result.data);
  }

  useEffect(() => {
    if (tokenValue) setfromAmount(totalAmount / tokenValue)
  }, [totalAmount])

  function handleLimitDecrement() {
    if (tokenValue > 0) {
      setTokenValue((prevValue) => prevValue - 1)
    }
  }
  function handleFromDecrement() {
    if (fromAmount > 0) {
      setfromAmount((prevValue) => prevValue - 1)
      console.log('total:', totalAmount, fromAmount)
    }
  }

  const handleTotalDecrement = () => {
    if (fromAmount > 0) {
      setTotalAmount((prevValue) => prevValue - 1)
    }
  }

  function handleFromIncrement() {
    setfromAmount((prevValue) => prevValue + 1)
  }

  function handleLimitIncrement() {
    setTokenValue((prevValue) => prevValue + 1)
  }

  const handleTotalIncrement = () => {
    setTotalAmount((prevValue) => prevValue + 1)
  }

  const handleSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault()
    const orderData = {
      limitBalance: tokenValue,
      fromAmount: fromAmount,
      totalAmount: totalAmount,
    }
    SubmitOrderData(orderData)
  }

  return (
    <div
      id='myLimitOrder'
      className='grid grid-flow-row items-center gap-3 py-5'
    >
      <div className='flex justify-between items-center rounded-lg p-1 mt-2.5 w-full h-9 border border-[#00000014] bg-white/10'>
        <button
          type='button'
          onClick={handleLimitDecrement}
          className='w-6 h-6 bg-gray-400 !rounded !p-0 hover:bg-gray-200 text-white/75 font-bold'
        >
          <MinusSmallIcon className=''></MinusSmallIcon>
        </button>
        <div className=' bg-transparent w-full'>
          <input
            type='number'
            id='balance-input'
            placeholder='0'
            value={tokenValue}
            onChange={(e) =>
              setTokenValue(
                parseFloat(e.target.value.length == 0 ? '0' : e.target.value)
              )
            }
            className='w-full text-white/80 bg-transparent text-center py-2 px-4 leading-tight focus:outline-none focus:inset-3 focus:shadow-outline focus:border focus:rounded-xl'
          />
        </div>
        <button
          type='button'
          onClick={handleLimitIncrement}
          className='w-6 h-6 bg-gray-400 !rounded !p-0 hover:bg-gray-200 text-white/75 font-bold'
        >
          <PlusSmallIcon></PlusSmallIcon>
        </button>
      </div>
      <div className='flex justify-between items-center rounded-lg p-1 mt-2.5 w-full h-9 border border-[#00000014] bg-white/10'>
        <button
          type='button'
          onClick={handleFromDecrement}
          className='w-6 h-6 bg-gray-400 !rounded !p-0 hover:bg-gray-200 text-white/75 font-bold'
        >
          <MinusSmallIcon className=''></MinusSmallIcon>
        </button>
        <div className=' bg-transparent w-full'>
          <input
            type='number'
            id='from-input'
            placeholder='Amount USDT'
            value={fromAmount}
            onChange={(e) =>
              setfromAmount(
                parseFloat(e.target.value.length == 0 ? '0' : e.target.value)
              )
            }
            className='w-full text-white/80 bg-transparent text-center py-2 px-4 leading-tight focus:outline-none focus:inset-3 focus:shadow-outline focus:border focus:rounded-xl'
          />
        </div>
        <button
          type='button'
          onClick={handleFromIncrement}
          className='w-6 h-6 bg-gray-400 !rounded !p-0 hover:bg-gray-200 text-white/75 font-bold'
        >
          <PlusSmallIcon></PlusSmallIcon>
        </button>
      </div>
      <div className='w-full grid grid-flow-col items-center justify-between px-1'>
        <div className='balance_div'>Available Balance</div>
        <div className='amount_div'>0 TON</div>
      </div>
      <div className='flex justify-between items-center rounded-lg p-1 mt-2.5 w-full h-9 border border-[#00000014] bg-white/10'>
        <button
          type='button'
          onClick={handleTotalDecrement}
          className='w-6 h-6 bg-gray-400 !rounded !p-0 hover:bg-gray-200 text-white/75 font-bold'
        >
          <MinusSmallIcon className=''></MinusSmallIcon>
        </button>
        <div className=' bg-transparent w-full'>
          <input
            type='number'
            id='total-input'
            placeholder='0'
            value={totalAmount}
            onChange={(e) =>
              setTotalAmount(
                parseFloat(e.target.value.length == 0 ? '0' : e.target.value)
              )
            }
            className='w-full text-white/80 bg-transparent text-center py-2 px-4 leading-tight focus:outline-none focus:inset-3 focus:shadow-outline focus:border focus:rounded-xl'
          />
        </div>
        <button
          type='button'
          onClick={handleTotalIncrement}
          className='w-6 h-6 bg-gray-400 !rounded !p-0 hover:bg-gray-200 text-white/75 font-bold'
        >
          <PlusSmallIcon></PlusSmallIcon>
        </button>
      </div>
      <div className='w-full px-1 grid grid-flow-col items-center justify-between'>
        <div className='balance_div'>Available Balance</div>
        <div className='amount_div'>0 TON</div>
      </div>
      <div className='flex gap-2 flex-col sm:flex-row justify-between text-center items-center'>
        <TonConnectButton />
        <button
          type='button'
          onClick={handleSubmit}
          className=' bg-btn_color h-10 flex rounded-md text-center items-center justify-center'
        >
          Submit
        </button>
      </div>
    </div>
  )
}
