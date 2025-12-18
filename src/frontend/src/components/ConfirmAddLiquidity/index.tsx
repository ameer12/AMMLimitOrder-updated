import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  confirmAddLiquidity,
  selectLiquidity,
} from '../../redux/reducers/liquidity'
import Button from '../Button'
import Header from './Header'
import styles from './index.module.scss'
import { useTonClient } from '../../hook/useTonClient'
import { useTonConnect } from '../../hook/useTonConnect'
import { checkTransactionStatus } from '../../api/swap'

export default function ConfirmAddLiquidity() {
  const liquidityState = useAppSelector(selectLiquidity)
  const dispatch = useAppDispatch()

  const client = useTonClient()
  const { sender } = useTonConnect()

  const preventClickThroughs = (e: React.MouseEvent<HTMLElement>) =>
    e.stopPropagation()

  if (liquidityState.token1 === null || liquidityState.token2 === null) {
    return null
  }

  const handleConfirmClick = () => {
    if (client && sender) dispatch(confirmAddLiquidity({ client, sender }))
  }

  return (
    <div className={styles.container} onClick={preventClickThroughs}>
      <Header />
      <TransactionSummary />
      <Estimation />
      <TransactionInfo />
      <Button
        buttonType='primaryLarge'
        title='Confirm Supply'
        onClick={handleConfirmClick}
      />
    </div>
  )
}

function TransactionSummary() {
  const {
    token1,
    token2,
    add: { position },
  } = useAppSelector(selectLiquidity)

  return (
    <div className={styles.transactionSummary}>
      <h1>{position?.liquidityTokens.toFixed(4) ?? 0}</h1>
      <img src={token1?.logoURI} alt={token1?.name} />
      <img src={token2?.logoURI} alt={token2?.name} />
      <span>
        {token1?.symbol}/{token2?.symbol} Pool Tokens
      </span>
    </div>
  )
}

function Estimation() {
  return (
    <p className={styles.estimation}>
      Estimated Output, Transaction will revert in case of more than{' '}
      <strong>0.8%</strong> price change.
    </p>
  )
}

function TransactionInfo() {
  const { token1, token2, inputs, conversionRate, add } =
    useAppSelector(selectLiquidity)

  return (
    <div className={styles.transactionInfo}>
      <label>{token1?.symbol} Deposited</label>
      <span>
        <img alt={token1?.name} src={token1?.logoURI} />
        {inputs.token1.toFixed(5)}
      </span>
      <label>{token2?.symbol} Deposited</label>
      <span>
        <img alt={token2?.name} src={token2?.logoURI} />
        {inputs.token2.toFixed(5)}
      </span>
      <label>Rate</label>
      <span>
        {conversionRate} {token1?.symbol}/{token2?.symbol}
      </span>
      {/* <label>Share of Pool</label>
      <span>{add.position?.share?.toFixed(5)}%</span> */}
    </div>
  )
}
