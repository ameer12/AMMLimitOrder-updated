import { showModal } from '../../redux/reducers/modals'
import { connect, selectAccount } from '../../redux/reducers/account'
import { useInputBalanceEffect } from '../../utils/hooks'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  changeInput,
  selectionModal,
  selectSwap,
  switchInputs,
  syncTokenBalances,
  conversionRate,
} from '../../redux/reducers/swap'
import { selectTokens } from '../../redux/reducers/tokens'
import { LimitOrderTab } from './LimitOrderTab'
import Info from '../icons/Info'
import SwitchButton from '../SwitchButton/SwitchButton'
import TokenInput from '../TokenInput2'

import './limit_order.scss'
import OrderItem, { OrderHeader } from './OrderItem'
import { selectLimitOrder } from '../../redux/reducers/limitOrder'
import { useEffect, useState } from 'react'
import { getLimitOrderRoutes, getLimitOrders } from '../../api/limitOrder'
import { fromNano } from '@ton/core'

var intervalId: string | number | NodeJS.Timeout | null | undefined = null
export const LimitOrders = () => {
  const accountState = useAppSelector(selectAccount)
  const swapState = useAppSelector(selectSwap)
  const tokenState = useAppSelector(selectTokens)
  const limitOrderState = useAppSelector(selectLimitOrder)
  const dispatch = useAppDispatch()

  const [sellOrdersList, setSellOrdersList] = useState<Array<any>>([])
  const [buyOrdersList, setBuyOrdersList] = useState<Array<any>>([])

  const handleFromChange = (value: number) =>
    dispatch(changeInput({ key: 'from', value }))
  const handleToChange = (value: number) =>
    dispatch(changeInput({ key: 'to', value }))
  const handleSwap = () => {
    dispatch(showModal('swap-confirmation'))
  }

  const handleSelectToken = (key: 'from' | 'to') => {
    dispatch(selectionModal(key))
    dispatch(showModal('swap-selection'))
  }
  const handleSwitch = () => dispatch(switchInputs())

  const handleSelectFromToken = () => handleSelectToken('from')
  const handleSelectToToken = () => handleSelectToken('to')

  useEffect(() => {
    if (intervalId) clearInterval(intervalId)

    if (limitOrderState.priceToken && limitOrderState.tradeToken) {
      intervalId = setInterval(async () => {
        if (limitOrderState.priceToken && limitOrderState.tradeToken) {
          const { pathsOfA2B, pathsOfB2A } = await getLimitOrderRoutes(
            limitOrderState.tradeToken?.address,
            limitOrderState.priceToken?.address
          )

          setSellOrdersList(pathsOfB2A)
          setBuyOrdersList(pathsOfA2B)
        } else {
          setSellOrdersList([])
          setBuyOrdersList([])
        }
      }, 5000)
    } else {
      setSellOrdersList([])
      setBuyOrdersList([])
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [limitOrderState.tradeToken, limitOrderState.priceToken])

  return (
    <div className='p-5 mb-5 flex flex-col gap-2 w-full bg-[#130F25] border border-[#2B2649] rounded-lg'>
      <h3>Order Book</h3>
      <OrderHeader
        priceToken={limitOrderState.priceToken?.symbol ?? ''}
        amountToken={limitOrderState.tradeToken?.symbol ?? ''}
      />
      {buyOrdersList.map((order, index) => (
        <OrderItem
          key={`buy${index}`}
          price={String(
            Number(
              (BigInt(order.inputResult) * BigInt(10 ** 5)) /
                BigInt(10 ** (limitOrderState.priceToken?.decimals ?? 0))
            ) /
              Number(
                (BigInt(order.outputResult) * BigInt(10 ** 5)) /
                  BigInt(10 ** (limitOrderState.tradeToken?.decimals ?? 0))
              )
          )}
          amount={String(
            Number(
              (BigInt(order.outputResult) * BigInt(10 ** 5)) /
                BigInt(10 ** (limitOrderState.tradeToken?.decimals ?? 0))
            ) /
              10 ** 5
          )}
          total={String(
            Number(
              (BigInt(order.inputResult) * BigInt(10 ** 5)) /
                BigInt(10 ** (limitOrderState.priceToken?.decimals ?? 0))
            ) /
              10 ** 5
          )}
          isSell={false}
        />
      ))}
      {sellOrdersList.map((order, index) => (
        <OrderItem
          key={`sell${index}`}
          price={String(
            Number(
              (BigInt(order.outputResult) * BigInt(10 ** 5)) /
                BigInt(10 ** (limitOrderState.priceToken?.decimals ?? 0))
            ) /
              Number(
                (BigInt(order.inputResult) * BigInt(10 ** 5)) /
                  BigInt(10 ** (limitOrderState.tradeToken?.decimals ?? 0))
              )
          )}
          amount={String(
            Number(
              (BigInt(order.inputResult) * BigInt(10 ** 5)) /
                BigInt(10 ** (limitOrderState.tradeToken?.decimals ?? 0))
            ) /
              10 ** 5
          )}
          total={String(
            Number(
              (BigInt(order.outputResult) * BigInt(10 ** 5)) /
                BigInt(10 ** (limitOrderState.priceToken?.decimals ?? 0))
            ) /
              10 ** 5
          )}
          isSell={true}
        />
      ))}
    </div>
  )
}
