import {
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
} from '@heroicons/react/20/solid'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { connect, selectAccount } from '../../redux/reducers/account'
import { panel } from '../../redux/reducers/liquidity'
import List from './List'
import { TonConnectButton } from '@tonconnect/ui-react'

export const LiquidityPanel = () => {
  const dispatch = useAppDispatch()
  const accountState = useAppSelector(selectAccount)
  const connected =
    accountState.walletAddress != null && accountState.walletAddress != ''
  const handleAddLiquidity = () => {
    // if (!connected) {
    //     //dispatch(connect());
    //   }else{
    dispatch(panel('add'))
    //   }
  }

  return (
    <div className='mx-auto px-4 lg:w-1/2 flex flex-col p-5 container pt-28'>
      <div className=' rounded-t-2xl bg-[#130F25] border border-[#2B2649] py-6 px-8 flex flex-row justify-between'>
        <div>
          <h2 className=' font-bold text-2xl'>Your liquidity</h2>
          <span className=' mt-2'>Remove liquidity to receive tokens back</span>
        </div>
        {/* <div className=' items-center flex flex-row gap-3'>
          <button className='p-1 outline-0 border-0 bg-transparent border-none'>
            <AdjustmentsHorizontalIcon
              className='w-6 h-6 text-[#1FC7D4] hover:opacity-50'
              onClick={() => {
                console.log('hi')
              }}
            ></AdjustmentsHorizontalIcon>
          </button>
          <button className='p-1 outline-0 border-0 bg-transparent'>
            <ArrowPathIcon
              className='w-6 h-6 text-[#1FC7D4] hover:opacity-50'
              onClick={() => {
                console.log('hi')
              }}
            ></ArrowPathIcon>
          </button>
        </div> */}
      </div>
      <div className=' border-x bg-[#000000] border border-[#2B2649] px-12 py-7'>
        <TonConnectButton />

        <button className=' bg-btn_color w-full' onClick={handleAddLiquidity}>
          {' '}
          + Add Liquidity
        </button>
      </div>
      <div className='rounded-b-2xl bg-[#130F25] border border-[#2B2649] py-6 px-8'>
        {/* <p className=" text-center">Connect to a wallet to view your liquidity.</p> */}
        <List />
      </div>
      {/* <List /> */}
    </div>
  )
}
