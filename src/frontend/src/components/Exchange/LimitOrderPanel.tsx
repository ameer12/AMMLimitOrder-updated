import {
  TonConnectButton,
  useTonConnectUI,
  useTonWallet,
} from '@tonconnect/ui-react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  changeInput,
  changeTxHash,
  refreshMyOrders,
  selectionModal,
  selectLimitOrder,
} from '../../redux/reducers/limitOrder'
import { showModal } from '../../redux/reducers/modals'
import { TokenBalanced } from '../../redux/types/tokens'
import styles from './index.module.scss'
import { Address, beginCell, toNano } from '@ton/core'
import { useTonClient } from '../../hook/useTonClient'
import { selectAccount } from '../../redux/reducers/account'
import { OrderBook } from '../../contracts/OrderBook'
import { JettonMaster } from '@ton/ton'
import { useTonConnect } from '../../hook/useTonConnect'
import { LimitOrders } from '../LimitOrders/LimitOrders'
import TonWeb from 'tonweb'
import { checkTransactionStatus } from '../../api/swap'
import { delay } from '../../api/util'
import { Buffer } from 'buffer'
import OrderItem from '../LimitOrders/OrderItem'
import { useEffect } from 'react'

export const TokenSelect = ({
  label,
  token,
  onSelectToken,
}: {
  label: string
  token: TokenBalanced | null
  onSelectToken?: () => void
}) => {
  return (
    <div className='flex justify-between bg-[#130F25] border border-[#2B2649] rounded-lg p-5 flex-1'>
      <div>
        <span className='text-sm'>{label}</span>
      </div>
      <div className='flex flex-col cursor-pointer' onClick={onSelectToken}>
        <div className='flex items-center justify-end gap-2'>
          {token !== null ? (
            <img
              className='h-6 w-6 rounded-full'
              src={token?.logoURI}
              alt={token.name}
            />
          ) : null}
          <span className='text-xs'>
            {token !== null ? token.symbol : 'Select Token'}
          </span>
        </div>
        <div>
          <span className='text-xs'>
            Balance: <b>{token?.balance ?? 0}</b>
          </span>
        </div>
      </div>
    </div>
  )
}

export default function LimitOrderPanel() {
  const limitOrderState = useAppSelector(selectLimitOrder)
  const accountState = useAppSelector(selectAccount)

  const dispatch = useAppDispatch()

  const wallet = useTonWallet()
  const [tonConnectUI] = useTonConnectUI()
  const { sender, singleSender } = useTonConnect()

  const client = useTonClient()

  const handleSelectToken = (key: 'tradeToken' | 'priceToken') => () => {
    dispatch(selectionModal(key))
    dispatch(showModal('limit-order-selection'))
  }

  const handleConnect = async () => {
    await tonConnectUI.connectWallet()
  }

  const handleTrade = (method: 'sell' | 'buy') => async () => {
    if (
      client &&
      accountState.walletAddress &&
      limitOrderState.tradeToken &&
      limitOrderState.priceToken
    ) {
      const orderBookAddress = Address.parse(
        import.meta.env.VITE_ORDER_BOOK_ADDRESS
      )

      const orderBook = client.open(
        OrderBook.createFromAddress(orderBookAddress)
      )
      //   const [id, ] = await orderBook.getOrderBookData()

      const tradeTokenContract = client.open(
        JettonMaster.create(Address.parse(limitOrderState.tradeToken.address))
      )

      const priceTokenContract = client.open(
        JettonMaster.create(Address.parse(limitOrderState.priceToken.address))
      )
      const tradeTokenWalletAddress = await tradeTokenContract.getWalletAddress(
        Address.parse(accountState.walletAddress)
      )
      const priceTokenWalletAddress = await priceTokenContract.getWalletAddress(
        Address.parse(accountState.walletAddress)
      )

      const orderBookTradeTokenWalletAddr =
        await tradeTokenContract.getWalletAddress(orderBookAddress)

      const orderBookPriceTokenWalletAddr =
        await priceTokenContract.getWalletAddress(orderBookAddress)

      if (method === 'sell') {
        if (
          Number(limitOrderState.sellPrice) &&
          Number(limitOrderState.sellAmount)
        ) {
          const forwardPayload = OrderBook.newSellOrderMessage(
            orderBookPriceTokenWalletAddr,
            BigInt(
              Number(limitOrderState.sellAmount) *
                Number(limitOrderState.sellPrice) *
                10 ** limitOrderState.priceToken.decimals
            ),
            tradeTokenContract.address,
            priceTokenContract.address
          )
          const messageBody = beginCell()
            .storeUint(0x0f8a7ea5, 32) // opcode for jetton transfer
            .storeUint(0, 64) // query id
            .storeCoins(
              Number(limitOrderState.sellAmount) *
                10 ** limitOrderState.tradeToken.decimals
            ) // jetton amount, amount * 10^9
            .storeAddress(orderBookAddress)
            .storeAddress(orderBookAddress) // response destination
            .storeMaybeRef(null) // no custom payload
            .storeCoins(toNano(0.15)) // forward amount - if >0, will send notification message
            .storeBit(1)
            .storeRef(forwardPayload)
            .endCell()

          const internalMessage = {
            to: tradeTokenWalletAddress,
            value: toNano(0.3),
            body: messageBody,
          }
          const response = await sender.send([internalMessage])

          const bocCell = TonWeb.boc.Cell.oneFromBoc(
            TonWeb.utils.base64ToBytes(response.boc)
          )

          console.log(
            'hash: ',
            Buffer.from(await bocCell.hash()).toString('hex')
          )

          const txHash = Buffer.from(await bocCell.hash()).toString('hex')

          dispatch(changeTxHash({ txHash, isSell: true }))
          dispatch(showModal('limit-order-confirmation'))
        }
      } else {
        if (
          Number(limitOrderState.buyPrice) &&
          Number(limitOrderState.buyAmount)
        ) {
          const forwardPayload = OrderBook.newBuyOrderMessage(
            orderBookTradeTokenWalletAddr,
            BigInt(
              Number(limitOrderState.buyAmount) *
                10 ** limitOrderState.tradeToken.decimals
            ),
            priceTokenContract.address,
            tradeTokenContract.address
          )
          const messageBody = beginCell()
            .storeUint(0x0f8a7ea5, 32) // opcode for jetton transfer
            .storeUint(0, 64) // query id
            .storeCoins(
              Number(limitOrderState.buyAmount) *
                Number(limitOrderState.buyPrice) *
                10 ** limitOrderState.priceToken.decimals
            ) // jetton amount, amount * 10^9
            .storeAddress(orderBookAddress)
            .storeAddress(orderBookAddress) // response destination
            .storeMaybeRef(null) // no custom payload
            .storeCoins(toNano(0.15)) // forward amount - if >0, will send notification message
            .storeBit(1)
            .storeRef(forwardPayload)
            .endCell()

          const internalMessage = {
            to: priceTokenWalletAddress,
            value: toNano(0.3),
            body: messageBody,
          }
          const response = await sender.send([internalMessage])

          const bocCell = TonWeb.boc.Cell.oneFromBoc(
            TonWeb.utils.base64ToBytes(response.boc)
          )

          console.log(
            'hash: ',
            Buffer.from(await bocCell.hash()).toString('hex')
          )

          const txHash = Buffer.from(await bocCell.hash()).toString('hex')

          dispatch(changeTxHash({ txHash, isSell: false }))
          dispatch(showModal('limit-order-confirmation'))
        }
      }
    }
  }

  const handleChangeInput =
    (key: 'buyPrice' | 'buyAmount' | 'sellPrice' | 'sellAmount') =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.currentTarget
      if (value.match(/^\d*(\.\d+)?$/g)) {
        dispatch(
          changeInput({
            key,
            value: Number.isNaN(value) ? '0' : value,
          })
        )
      }
    }

  const cancelBuyOrder = (id: number) => async () => {
    if (client) {
      const orderBookAddress = Address.parse(
        import.meta.env.VITE_ORDER_BOOK_ADDRESS
      )

      const orderBook = client.open(
        OrderBook.createFromAddress(orderBookAddress)
      )

      await orderBook.sendCancelBuyOrder(singleSender, BigInt(id))
    }
  }

  const cancelSellOrder = (id: number) => () => {}

  useEffect(() => {
    if (accountState.walletAddress)
      dispatch(refreshMyOrders({ walletAddress: accountState.walletAddress }))
  }, [dispatch, accountState.walletAddress])

  return (
    <div className='mx-10 bg-[#130F25] border border-[#2B2649] rounded-lg p-10 flex-1 flex flex-col gap-2'>
      <h3>My Orders</h3>
      <div className='flex flex-col gap-2'>
        {limitOrderState.myOrders.buyOrdersList.map((order, index) => {
          return (
            <OrderItem
              key={`buy${index}`}
              price={String(
                Number(
                  (BigInt(order.realJettonAmount) * BigInt(10 ** 5)) /
                    BigInt(10 ** (Number(order.token1Address.decimals) ?? 0))
                ) /
                  Number(
                    (BigInt(order.realMinOutAmount) * BigInt(10 ** 5)) /
                      BigInt(10 ** (Number(order.token2Address.decimals) ?? 0))
                  )
              )}
              amount={String(
                Number(
                  (BigInt(order.realMinOutAmount) * BigInt(10 ** 5)) /
                    BigInt(10 ** (Number(order.token2Address.decimals) ?? 0))
                ) /
                  10 ** 5
              )}
              total={String(
                Number(
                  (BigInt(order.realJettonAmount) * BigInt(10 ** 5)) /
                    BigInt(10 ** (Number(order.token1Address.decimals) ?? 0))
                ) /
                  10 ** 5
              )}
              isSell={false}
              token1={order.token2Address.symbol}
              token2={order.token1Address.symbol}
              cancel={cancelBuyOrder(order.id)}
            />
          )
        })}
        {limitOrderState.myOrders.sellOrdersList.map((order, index) => (
          <OrderItem
            key={`sell${index}`}
            price={String(
              Number(
                (BigInt(order.realMinOutAmount) * BigInt(10 ** 5)) /
                  BigInt(10 ** (Number(order.token2Address.decimals) ?? 0))
              ) /
                Number(
                  (BigInt(order.realJettonAmount) * BigInt(10 ** 5)) /
                    BigInt(10 ** (Number(order.token1Address.decimals) ?? 0))
                )
            )}
            amount={String(
              Number(
                (BigInt(order.realJettonAmount) * BigInt(10 ** 5)) /
                  BigInt(10 ** (Number(order.token1Address.decimals) ?? 0))
              ) /
                10 ** 5
            )}
            total={String(
              Number(
                (BigInt(order.realMinOutAmount) * BigInt(10 ** 5)) /
                  BigInt(10 ** (Number(order.token2Address.decimals) ?? 0))
              ) /
                10 ** 5
            )}
            isSell={true}
            token2={order.token2Address.symbol}
            token1={order.token1Address.symbol}
            cancel={cancelSellOrder(order.id)}
          />
        ))}
      </div>
      <h3>Limit Order</h3>
      <div className='flex gap-2'>
        <TokenSelect
          label='Trade Token'
          token={limitOrderState.tradeToken}
          onSelectToken={handleSelectToken('tradeToken')}
        />
        <TokenSelect
          label='Price Token'
          token={limitOrderState.priceToken}
          onSelectToken={handleSelectToken('priceToken')}
        />
      </div>
      <div className='flex gap-2'>
        <div className='border border-[#2B2649] rounded-lg p-5 flex-1'>
          <div className={styles.input}>
            <label>Price({limitOrderState.priceToken?.symbol})</label>
            <input
              value={`${limitOrderState.buyPrice}`}
              onChange={handleChangeInput('buyPrice')}
              type='number'
            />
          </div>
          <div className={styles.input}>
            <label>Amount({limitOrderState.tradeToken?.symbol})</label>
            <input
              value={`${limitOrderState.buyAmount}`}
              onChange={handleChangeInput('buyAmount')}
              type='number'
            />
          </div>
          <div className={styles.input}>
            <label>Total({limitOrderState.priceToken?.symbol})</label>
            <input
              value={`${
                Number(limitOrderState.buyPrice) *
                Number(limitOrderState.buyAmount)
              }`}
              onChange={() => {}}
              type='number'
            />
          </div>
          <TonConnectButton />
          {wallet ? (
            <button
              className='bg-[#662483] w-full mt-8'
              onClick={handleTrade('buy')}
            >
              Buy {limitOrderState.tradeToken?.symbol}
            </button>
          ) : (
            <button
              className=' bg-[#662483] w-full mt-8'
              onClick={handleConnect}
            >
              Connect wallet{' '}
            </button>
          )}
        </div>

        <div className='border border-[#2B2649] rounded-lg p-5 flex-1'>
          <div className={styles.input}>
            <label>Price({limitOrderState.priceToken?.symbol})</label>
            <input
              value={`${limitOrderState.sellPrice}`}
              onChange={handleChangeInput('sellPrice')}
              type='number'
            />
          </div>
          <div className={styles.input}>
            <label>Amount({limitOrderState.tradeToken?.symbol})</label>
            <input
              value={`${limitOrderState.sellAmount}`}
              onChange={handleChangeInput('sellAmount')}
              type='number'
            />
          </div>
          <div className={styles.input}>
            <label>Total({limitOrderState.priceToken?.symbol})</label>
            <input
              value={`${
                Number(limitOrderState.sellPrice) *
                Number(limitOrderState.sellAmount)
              }`}
              onChange={() => {}}
              type='number'
            />
          </div>

          {wallet ? (
            <button
              className='bg-[#662483] w-full mt-8'
              onClick={handleTrade('sell')}
            >
              Sell {limitOrderState.tradeToken?.symbol}
            </button>
          ) : (
            <button
              className='bg-[#662483] w-full mt-8'
              onClick={handleConnect}
            >
              Connect wallet{' '}
            </button>
          )}
        </div>
      </div>
      <LimitOrders />
    </div>
  )
}
