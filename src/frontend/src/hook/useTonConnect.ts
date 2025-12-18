import { Address, Cell } from '@ton/core'
import {
  toUserFriendlyAddress,
  useTonConnectUI,
  useTonWallet,
} from '@tonconnect/ui-react'
import { useCallback, useEffect, useState } from 'react'

interface Message {
  to: Address
  value: bigint
  body: Cell
}

export function useTonConnect() {
  const [address, setAddress] = useState('')

  const wallet = useTonWallet()
  const [tonConnectUI] = useTonConnectUI()

  const getAddress = useCallback(() => {
    const addr = wallet?.account?.address
    if (addr) {
      setAddress(toUserFriendlyAddress(addr, true))
    }
  }, [wallet?.account?.address])

  useEffect(() => {
    getAddress()
  }, [wallet?.account?.address, getAddress])

  return {
    sender: {
      send: async (messages: Message[]) => {
        return tonConnectUI.sendTransaction(
          {
            messages: messages.map((msg) => ({
              address: msg.to.toString(),
              amount: msg.value.toString(),
              payload: msg.body?.toBoc().toString('base64'),
            })),
            validUntil: Date.now() + 5 * 60 * 1000, // 5 minutes for user to approve
          },
          { modals: ['before', 'error'] }
        )
      },
    },
    singleSender: {
      send: async (args: any) => {
        tonConnectUI.sendTransaction({
          messages: [
            {
              address: args.to.toString(),
              amount: args.value.toString(),
              payload: args.body?.toBoc().toString('base64'),
            },
          ],
          validUntil: Date.now() + 5 * 60 * 1000, // 5 minutes for user to approve
        })
      },
    },
    address,
    connected: tonConnectUI.connected,
  }
}
