import Button from '../Button'

export default function OrderItem({
  price,
  amount,
  total,
  isSell,
  token1,
  token2,
  cancel,
}: {
  price: string
  amount: string
  total: string
  isSell: boolean
  token1?: string
  token2?: string
  cancel?: () => void
}) {
  return (
    <div className='flex gap-2 items-center'>
      <div className='flex-1'>
        <span className={isSell ? 'text-red-500' : 'text-green-500'}>
          {price}
        </span>
      </div>
      <div className='min-w-28 text-end'>
        <span>
          {amount}
          {token1 ? `(${token1})` : ''}
        </span>
      </div>
      <div className='min-w-28 text-end'>
        <span>
          {total}
          {token2 ? `(${token2})` : ''}
        </span>
      </div>
      {cancel && <Button title='Cancel Order' onClick={cancel} />}
    </div>
  )
}

export const OrderHeader = ({
  priceToken,
  amountToken,
}: {
  priceToken: string
  amountToken: string
}) => {
  return (
    <div className='flex gap-2'>
      <div className='flex-1'>
        <span>Price({priceToken})</span>
      </div>
      <div className='min-w-20 text-end'>
        <span>Amount({amountToken})</span>
      </div>
      <div className='min-w-20 text-end'>
        <span>Total({priceToken})</span>
      </div>
    </div>
  )
}
