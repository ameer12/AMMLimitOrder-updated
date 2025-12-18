'use client'
import {
  TonConnectButton,
  useTonConnectUI,
  useTonWallet,
  useTonAddress,
  TonConnectUI,
} from '@tonconnect/ui-react'
import { useEffect, useState } from 'react'
import { showModal } from '../../redux/reducers/modals'
import { connect, selectAccount } from '../../redux/reducers/account'
import { useInputBalanceEffect } from '../../utils/hooks'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  changeInput,
  selectionModal,
  selectOrder,
  switchInputs,
  syncTokenBalances,
  conversionRate,
  changeTxHash,
} from '../../redux/reducers/order'
import { selectTokens } from '../../redux/reducers/tokens'
import Info from '../icons/Info'
import SwitchButton from '../SwitchButton/SwitchButton'
import TokenInput from '../TokenInput2'

import './TONConnectButton.scss'
import { useTonClient } from '../../hook/useTonClient'
import { getPoolExist } from '../../api/pool'
import { Link } from 'react-router-dom'
import { useTonConnect } from '../../hook/useTonConnect'
import { Address, beginCell, toNano } from '@ton/core'
import { JettonMaster } from '@ton/ton'
import TonWeb from 'tonweb'
import { Buffer } from 'buffer'

export const OrderPanel = () => {
  const wallet = useTonWallet()
  const [tonConnectUI] = useTonConnectUI()
  const accountState = useAppSelector(selectAccount)
  const orderState = useAppSelector(selectOrder)
  const tokenState = useAppSelector(selectTokens)
  const dispatch = useAppDispatch()

  const client = useTonClient()
  const { sender } = useTonConnect()

  const connected =
    accountState.walletAddress !== null && accountState.walletAddress !== ''
  const userFriendlyAddress = useTonAddress()

  useEffect(() => {
    if (orderState.from !== null && orderState.to !== null && client)
      dispatch(
        conversionRate({
          client,
          from: orderState.from,
          to: orderState.to,
          isFrom: orderState.inputs.isFrom,
          amount: orderState.inputs.isFrom
            ? orderState.inputs.from
            : orderState.inputs.to,
        })
      )
    if (userFriendlyAddress !== '' || userFriendlyAddress !== null) {
      dispatch(connect(userFriendlyAddress))
    }
  }, [
    userFriendlyAddress,
    orderState.from,
    orderState.to,
    orderState.inputs,
    client,
  ])

  const handleConnect = async () => {
    await tonConnectUI.connectWallet()
  }
  const handleSwap = async () => {
    if (
      client &&
      accountState.walletAddress &&
      orderState.path.length &&
      orderState.from &&
      orderState.to
    ) {
      const orderBookAddress = Address.parse(
        import.meta.env.VITE_ORDER_BOOK_ADDRESS
      )
      const routerAddress = Address.parse(import.meta.env.VITE_ROUTER_ADDRESS)
      const pathCell = beginCell()
        .storeUint(0x1df5ba95, 32) // market order opcode
        .storeAddress(Address.parse(accountState.walletAddress))
        .storeAddress(Address.parse(accountState.walletAddress))

      let pathRef = beginCell().endCell()
      for (let i = orderState.path.length - 1; i > 0; i--) {
        const prevJettonMaster = client.open(
          JettonMaster.create(Address.parse(orderState.path[i - 1]))
        )
        const prevOrderBookJettonWallet =
          await prevJettonMaster.getWalletAddress(orderBookAddress)

        const nextJettonMaster = client.open(
          JettonMaster.create(Address.parse(orderState.path[i]))
        )

        const nextOrderBookJettonWallet =
          await nextJettonMaster.getWalletAddress(orderBookAddress)
        const nextRouterJettonWallet = await nextJettonMaster.getWalletAddress(
          routerAddress
        )

        pathRef = beginCell()
          .storeAddress(prevOrderBookJettonWallet)
          .storeAddress(nextOrderBookJettonWallet)
          .storeAddress(nextRouterJettonWallet)
          .storeCoins(toNano(0.0000001))
          .storeUint(0, 1)
          .storeRef(pathRef)
          .endCell()
      }

      pathCell.storeRef(pathRef)

      const forwardPayloadForMarketOrder = beginCell()
        .storeUint(0, 32)
        .storeRef(pathCell.endCell())
        .endCell()

      const messageBody = beginCell()
        .storeUint(0x0f8a7ea5, 32) // opcode for jetton transfer
        .storeUint(0, 64) // query id
        .storeCoins(toNano(orderState.inputs.from)) // jetton amount, amount * 10^9
        .storeAddress(orderBookAddress)
        .storeAddress(orderBookAddress) // response destination
        .storeMaybeRef(null) // no custom payload
        .storeCoins(toNano(0.2 * orderState.path.length + 0.1)) // forward amount - if >0, will send notification message
        .storeBit(1)
        .storeRef(forwardPayloadForMarketOrder)
        .endCell()

      const token1Contract = client.open(
        JettonMaster.create(Address.parse(orderState.from.address))
      )

      const token1WalletAddress = await token1Contract.getWalletAddress(
        Address.parse(accountState.walletAddress)
      )
      const internalMessage = {
        to: token1WalletAddress,
        value: toNano(0.2 * (orderState.path.length + 1)),
        body: messageBody,
      }

      const response = await sender.send([internalMessage])
      const bocCell = TonWeb.boc.Cell.oneFromBoc(
        TonWeb.utils.base64ToBytes(response.boc)
      )

      console.log('hash: ', Buffer.from(await bocCell.hash()).toString('hex'))

      const txHash = Buffer.from(await bocCell.hash()).toString('hex')
      dispatch(changeTxHash({ txHash }))
      dispatch(showModal('order-confirmation'))
    }
  }

  const handleSelectToken = (key: 'from' | 'to') => {
    dispatch(selectionModal(key))
    dispatch(showModal('order-selection'))
  }
  let mainContent = {}

  mainContent = tokenState.displayList.length === 0 ? <div></div> : <div></div>

  const handleFromChange = (value: number) =>
    dispatch(changeInput({ key: 'from', value }))
  const handleToChange = (value: number) =>
    dispatch(changeInput({ key: 'to', value }))

  const handleSwitch = () => dispatch(switchInputs())

  const handleSelectFromToken = () => handleSelectToken('from')
  const handleSelectToToken = () => handleSelectToken('to')

  const confirmDisabled =
    orderState.from === null ||
    orderState.to === null ||
    (orderState.inputs.from === 0 && orderState.inputs.to === 0)

  useInputBalanceEffect(orderState.from, orderState.to, syncTokenBalances)

  return (
    <div className='mx-10 flex flex-col p-0 pb-5 flex-1'>
      <div className='rounded-lg bg-[#130F25] border border-[#2B2649] p-10'>
        <div className='flex flex-col py-2 gap-5'>
          <h3>Market Order</h3>
          <TokenInput
            label='From'
            value={orderState.inputs.from}
            onChange={handleFromChange}
            token={orderState.from}
            onSelectToken={handleSelectFromToken}
          />
          <SwitchButton onClick={handleSwitch} />
          <TokenInput
            label='To'
            value={orderState.inputs.to}
            onChange={handleToChange}
            token={orderState.to}
            onSelectToken={handleSelectToToken}
          />
          <span className='flex flex-row items-center gap-2'>
            {orderState.conversionRate !== 0 &&
            orderState.from !== null &&
            orderState.to !== null ? (
              <div>
                <Info />
                <span>
                  1 {orderState.from?.symbol} = {orderState.conversionRate}{' '}
                  {orderState.to?.symbol} ($
                  {orderState.usdtRate})
                </span>
              </div>
            ) : null}
          </span>
        </div>
        <TonConnectButton />
        {wallet ? (
          <button
            className='bg-[#662483] w-full mt-8'
            onClick={handleSwap}
            disabled={confirmDisabled}
          >
            Swap
          </button>
        ) : (
          <button className=' bg-[#662483] w-full mt-8' onClick={handleConnect}>
            Connect wallet{' '}
          </button>
        )}
      </div>
    </div>
  )
}
