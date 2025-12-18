import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  confirmRemoveLiquidity,
  selectLiquidity,
} from '../../redux/reducers/liquidity'
import Button from '../Button'
import Plus from '../icons/Plus'
import Header from './Header'
import styles from './index.module.scss'
import { useTonClient } from '../../hook/useTonClient'
import { useTonConnect } from '../../hook/useTonConnect'
import { selectAccount } from '../../redux/reducers/account'
import { Pool } from '../../contracts/Pool'
import { Address } from '@ton/core'
import { Router } from '../../contracts/Router'
import { JettonMaster } from '@ton/ton'

export default function ConfirmRemoveLiquidity() {
  const liquidityState = useAppSelector(selectLiquidity)
  const dispatch = useAppDispatch()
  const client = useTonClient()
  const { singleSender } = useTonConnect()

  const { walletAddress } = useAppSelector(selectAccount)

  const preventClickThroughs = (e: React.MouseEvent<HTMLElement>) =>
    e.stopPropagation()

  const handleConfirmClick = () => {
    if (client && walletAddress) {
      dispatch(
        confirmRemoveLiquidity({
          client,
          sender: singleSender,
          address: walletAddress,
        })
      )
    }
  }

  // if (liquidityState.remove.lpRate === null) {
  //   return null;
  // }

  return (
    <div className={styles.container} onClick={preventClickThroughs}>
      <Header />
      <TransactionSummary />
      {/* <Estimation /> */}
      {/* <TransactionInfo /> */}
      <Button
        buttonType='primaryLarge'
        title='Confirm Remove'
        onClick={handleConfirmClick}
      />
    </div>
  )
}

function TransactionSummary() {
  const { remove } = useAppSelector(selectLiquidity)

  const [amount0, setAmount0] = useState<number>(0)
  const [amount1, setAmount1] = useState<number>(0)

  const client = useTonClient()

  if (!remove.position?.pool) {
    return null
  }

  const { token1, token2 } = remove.position.pool

  useEffect(() => {
    if (
      remove.position &&
      remove.position?.pool &&
      client &&
      remove.position?.liquidityTokens
    ) {
      const { token1, token2 } = remove.position.pool

      ;(async () => {
        const pool = client.open(
          Pool.createFromAddress(
            Address.parse(remove.position?.pool?.address ?? '')
          )
        )

        if (remove.position) {
          const [amount0, amount1] = await pool.getExpectedLiquidity(
            BigInt(remove.position.liquidityTokens * 10 ** 9)
          )

          const { token0Address, token1Address } = await pool.getPoolData()

          if (
            Address.parse(token1?.address ?? '').toString() ===
            token0Address.toString()
          ) {
            setAmount0(Number(amount0) / 10 ** (token1?.decimals ?? 0))
            setAmount1(Number(amount1) / 10 ** (token2?.decimals ?? 0))
          } else {
            setAmount0(Number(amount1) / 10 ** (token1?.decimals ?? 0))
            setAmount1(Number(amount0) / 10 ** (token2?.decimals ?? 0))
          }
        }
      })()
    }
  }, [remove.position?.pool, client, remove.position?.liquidityTokens])

  return (
    <div className={styles.transactionSummary}>
      <span>
        <img src={token1?.logoURI} alt={token1?.name} /> {amount0}
      </span>
      <label>{token1?.symbol}</label>
      <Plus />
      <div />
      <span>
        <img src={token2?.logoURI} alt={token2?.name} /> {amount1}
      </span>
      <label>{token2?.symbol}</label>
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
  const { remove } = useAppSelector(selectLiquidity)
  if (!remove.position?.pool) {
    return null
  }
  const { token1, token2 } = remove.position.pool
  const percentValue = parseFloat(remove.percent.slice(0, -1))

  return (
    <div className={styles.transactionInfo}>
      <label>
        LP {token1?.symbol}/{token2?.symbol} Burned
      </label>
      <span>
        <img alt={token1?.name} src={token1?.logoURI} />
        <img alt={token2?.name} src={token2?.logoURI} />
        {((remove.position.liquidityTokens * percentValue) / 100).toFixed(4)}
      </span>
      <label>Rate</label>
      <span>
        {(remove.position.pool.info?.fwdRate ?? 0).toFixed(4)} {token1?.symbol}/
        {token2?.symbol}
      </span>
    </div>
  )
}
