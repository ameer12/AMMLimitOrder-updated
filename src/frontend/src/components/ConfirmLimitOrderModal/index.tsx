'use client'

import React, { useEffect, useState } from 'react'
import TonWeb from 'tonweb'
import { Token } from '../../api/tokens'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { showModal } from '../../redux/reducers/modals'
import { confirmSwap, selectSwap } from '../../redux/reducers/swap'
import { connect, selectAccount } from '../../redux/reducers/account'
import { Router, ROUTER_REVISION, ROUTER_REVISION_ADDRESS } from '@ston-fi/sdk'
import { Buffer } from 'buffer'

import Button from '../Button'
import Arrow from '../icons/Arrow'
import Close from '../icons/Close'
import styles from './index.module.scss'
import account from '../../redux/reducers/account'
import { useTonConnectUI } from '@tonconnect/ui-react'
import { MessageData } from '@ston-fi/sdk/dist/types'
import { useTonClient } from '../../hook/useTonClient'
import { Address, beginCell, toNano } from '@ton/core'
import { Router as RouterContract } from '../../contracts/Router'
import { JettonMaster } from '@ton/ton'
import { useTonConnect } from '../../hook/useTonConnect'
import {
  checkTransactionStatus,
  getTransaction,
  getTransactions,
} from '../../api/swap'
import { selectLimitOrder } from '../../redux/reducers/limitOrder'
import { OrderBook } from '../../contracts/OrderBook'
import { expectLimitOrder } from '../../api/limitOrder'

var intervalId: string | number | NodeJS.Timeout | undefined

export default function ConfirmLimitOrderModal() {
  const [isConfirmed, setIsConfirmed] = useState(false)
  const dispatch = useAppDispatch()
  const limitOrderState = useAppSelector(selectLimitOrder)

  const client = useTonClient()

  const handleDismiss = () => dispatch(showModal(null))

  useEffect(() => {
    if (limitOrderState.txHash && client) {
      if (intervalId) clearInterval(intervalId)

      const orderBookAddress = Address.parse(
        import.meta.env.VITE_ORDER_BOOK_ADDRESS
      )

      const orderBook = client.open(
        OrderBook.createFromAddress(orderBookAddress)
      )

      intervalId = setInterval(async () => {
        if (limitOrderState.txHash) {
          try {
            const isConfirmed = await checkTransactionStatus(
              limitOrderState.txHash
            )

            if (isConfirmed) {
              clearInterval(intervalId)

              setIsConfirmed(true)

              const [isLocked, adminAddress, buysCount, sellsCount] =
                await orderBook.getOrderBookData()

              if (limitOrderState.isSell) {
                await expectLimitOrder((sellsCount as number) - 1, false)
              } else {
                await expectLimitOrder((buysCount as number) - 1, true)
              }
            }
          } catch (e) {
            console.log(e)
          }
        }
      }, 1000)
    }
  }, [limitOrderState.txHash, client])

  return limitOrderState.txHash && isConfirmed ? (
    <div className={styles.container}>
      <div className={styles.title}>
        <h2>Transaction confirmed!</h2>
        <Close onClick={handleDismiss} />
      </div>
      <div className={styles.transactionSummary}>
        <h3>
          Check transaction details{' '}
          <a
            href={`${import.meta.env.VITE_TONVIEWER_URL}/transaction/${
              limitOrderState.txHash
            }`}
            className='text-gray-500'
          >
            here
          </a>
        </h3>
      </div>
    </div>
  ) : (
    <div className={styles.container}>
      <div className={styles.title}>
        <h2>Transaction sent for confirmation.</h2>
        <Close onClick={handleDismiss} />
      </div>
      <div className={styles.transactionSummary}>
        <h3>Transaction will be processed in a few seconds...</h3>
      </div>
    </div>
  )
}
