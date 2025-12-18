import cn from 'classnames'
import { useEffect, useState } from 'react'
import { CSSTransition } from 'react-transition-group'
import { PoolPositionInfo } from '../../api/pool'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { selectAccount } from '../../redux/reducers/account'
import {
  changeRemovePosition,
  changeToken,
  panel,
  retrieveLiquidities,
  selectLiquidity,
} from '../../redux/reducers/liquidity'
import Button from '../Button'
import Chevron from '../icons/Chevron'
import styles from './index.module.scss'
import { useTonClient } from '../../hook/useTonClient'
import { useTonConnect } from '../../hook/useTonConnect'
import { showModal } from '../../redux/reducers/modals'
import { selectTokens } from '../../redux/reducers/tokens'
import { ArrowPathIcon } from '@heroicons/react/24/outline'

export default function List() {
  const { walletAddress } = useAppSelector(selectAccount)
  const { liquidity, isListingLiquidities } = useAppSelector(selectLiquidity)
  const { totalTokens } = useAppSelector(selectTokens)
  const dispatch = useAppDispatch()

  const client = useTonClient()

  const { connected } = useTonConnect()

  const handleRefresh = () => {
    if (
      client &&
      walletAddress &&
      dispatch &&
      totalTokens &&
      totalTokens.length
    ) {
      dispatch(retrieveLiquidities(client))
    }
  }

  useEffect(() => {
    if (
      client &&
      walletAddress &&
      dispatch &&
      totalTokens &&
      totalTokens.length
    ) {
      dispatch(retrieveLiquidities(client))
    }
  }, [walletAddress, dispatch, client, totalTokens])

  return (
    <div className={styles.list}>
      <div className='flex justify-between items-center'>
        <h3>Your Liquidity</h3>
        <ArrowPathIcon
          className='w-6 h-6 text-[#1FC7D4] hover:opacity-50 cursor-pointer'
          onClick={handleRefresh}
        ></ArrowPathIcon>
      </div>
      {!connected ? (
        <NotConnected />
      ) : liquidity === null || liquidity.length === 0 ? (
        isListingLiquidities ? (
          <p>Fetching liquidity data</p>
        ) : (
          <EmptyList />
        )
      ) : (
        liquidity.map((position, index) => (
          <Item
            key={position.pool?.address ?? `pos-${index}`}
            positionInfo={position}
          />
        ))
      )}
    </div>
  )
}

function NotConnected() {
  return (
    <div className={styles.emptyList}>
      <h5>Connect to a wallet to view your liquidity.</h5>
    </div>
  )
}
function EmptyList() {
  return (
    <div className={styles.emptyList}>
      <h5>No liquidity found.</h5>
    </div>
  )
}

interface IItemProps {
  positionInfo: PoolPositionInfo
}

function Item({ positionInfo }: IItemProps) {
  const [expanded, setExpanded] = useState<boolean>(false)
  const dispatch = useAppDispatch()

  const { pool } = positionInfo

  const handleExpanded = () => {
    setExpanded((p) => !p)
  }

  const handleRemoveClick = () => {
    dispatch(changeRemovePosition(positionInfo))
    dispatch(showModal('confirm-remove'))
  }

  const handleAddLiquidity = () => {
    if (pool?.token1) {
      dispatch(changeToken({ key: 'token1', value: pool.token1 }))
    }

    if (pool?.token2) {
      dispatch(changeToken({ key: 'token2', value: pool.token2 }))
    }

    dispatch(panel('add'))
  }

  return (
    <div>
      <div className={styles.item} onClick={handleExpanded}>
        <img alt={pool?.token1?.name} src={pool?.token1?.logoURI} />
        <img alt={pool?.token2?.name} src={pool?.token2?.logoURI} />
        <span>
          {pool?.token1?.symbol}/{pool?.token2?.symbol}
        </span>
        <Chevron className={cn({ [styles.expandedChevron]: expanded })} />
      </div>
      <CSSTransition
        mountOnEnter
        unmountOnExit
        in={expanded}
        timeout={300}
        classNames={{
          enter: styles.enter,
          enterActive: styles.enterActive,
          exit: styles.exit,
          exitActive: styles.exitActive,
        }}
      >
        <div className={styles.details}>
          <div className={styles.info}>
            <label>Pooled {pool?.token1?.symbol}:</label>
            <span>
              {positionInfo.token1V?.toFixed(5) ?? 0}{' '}
              <img alt={pool?.token1?.name} src={pool?.token1?.logoURI} />
            </span>
            <label>Pooled {pool?.token2?.symbol}:</label>
            <span>
              {positionInfo.token2V?.toFixed(5) ?? 0}{' '}
              <img alt={pool?.token2?.name} src={pool?.token2?.logoURI} />
            </span>
            <label>Pool Tokens:</label>
            <span>{positionInfo.liquidityTokens.toFixed(5)}</span>
            {/* <label>Pool Share:</label>
            <span>{positionInfo.share?.toFixed(3)}%</span> */}
          </div>
          <div className={styles.actions}>
            <Button
              buttonType='primarySmall'
              title='Add'
              onClick={handleAddLiquidity}
            />
            <Button
              buttonType='primarySmall'
              title='Remove'
              onClick={handleRemoveClick}
            />
          </div>
        </div>
      </CSSTransition>
    </div>
  )
}
