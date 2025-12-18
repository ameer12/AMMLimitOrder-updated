import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getPoolData } from '../../api/pool'
import { getTokenInfo } from '../../api/tokens'
import { TokenBalanced } from '../../redux/types/tokens'
import { useTonClient } from '../../hook/useTonClient'
import { conversionRate } from '../../api/swap'

export interface PoolType {
  id: number
  address: string
  collectedToken0ProtocolFee: string
  collectedToken1ProtocolFee: string
  deprecated: boolean
  lpFee: number
  lpTotalSupply: string
  protocolFee: number
  protocolFeeAddress: string
  refFee: number
  reserve0: string
  reserve1: string
  routerAddress: string
  token0Address: string
  token1Address: string
  token0?: TokenBalanced
  token1?: TokenBalanced
}

export default function Pool() {
  const { token1, token2 } = useParams()
  const [pool, setPool] = useState<PoolType>()
  const [conversionRate1, setConversionRate1] = useState<number>(0)
  const [conversionRate2, setConversionRate2] = useState<number>(0)

  const client = useTonClient()

  useEffect(() => {
    if (token1 && token2) {
      getPoolData(token1, token2).then(async (pool) => {
        const token0 = await getTokenInfo(pool.token0Address)
        if (token0) {
          pool.token0 = token0
        }

        const token1 = await getTokenInfo(pool.token1Address)
        if (token1) {
          pool.token1 = token1
        }

        setPool(pool)

        if (client && token0 && token1) {
          const { fwd: rate1 } = await conversionRate(client, token0, token1, 1)
          const { bwd: rate2 } = await conversionRate(
            client,
            token0,
            token1,
            1,
            false
          )

          setConversionRate1(rate1)
          setConversionRate2(rate2)
        }
      })
    }
  }, [token1, token2, client])

  if (pool) {
    return (
      <div className='py-20 mx-20'>
        <div className='flex items-center gap-2'>
          <div className='flex'>
            <img
              alt={pool.token0?.name}
              src={pool.token0?.logoURI}
              className='w-8 h-8 rounded-full'
            />
            <img
              alt={pool.token1?.name}
              src={pool.token1?.logoURI}
              className='w-8 h-8 rounded-full'
            />
          </div>
          <span className='text-lg'>
            {pool.token0?.symbol} / {pool.token1?.symbol}
          </span>
        </div>

        <div className='mt-2 border-t flex flex-col gap-2 p-2'>
          <span>
            1 {pool.token0?.symbol} = {conversionRate1} {pool.token1?.symbol}
          </span>
          <span>
            1 {pool.token1?.symbol} = {conversionRate2} {pool.token0?.symbol}
          </span>
        </div>
      </div>
    )
  } else {
    return <div>Not found</div>
  }
}
