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
import { selectOrder } from '../../redux/reducers/order'

var intervalId: string | number | NodeJS.Timeout | undefined

export default function ConfirmOrderModal() {
  const [isConfirmed, setIsConfirmed] = useState(false)
  const dispatch = useAppDispatch()
  const orderState = useAppSelector(selectOrder)

  const handleDismiss = () => dispatch(showModal(null))

  useEffect(() => {
    if (orderState.txHash) {
      if (intervalId) clearInterval(intervalId)

      intervalId = setInterval(async () => {
        if (orderState.txHash) {
          const isConfirmed = await checkTransactionStatus(orderState.txHash)

          if (isConfirmed) {
            clearInterval(intervalId)

            setIsConfirmed(true)
          }
        }
      }, 1000)
    }
  }, [orderState.txHash])

  return orderState.txHash && isConfirmed ? (
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
              orderState.txHash
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
