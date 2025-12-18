import axios from 'axios'

export const getMarketOrderResult = async (
  inputToken: string,
  outputToken: string,
  amount: number
) => {
  try {
    const { success, data } = await axios
      .post(`${import.meta.env.VITE_BACKEND_URL}/market-order/expect`, {
        inputToken,
        outputToken,
        amount,
      })
      .then((response) => response.data)

    if (success) {
      const { result } = data
      if (result) {
        const { path, amount: resultAmount } = result

        return { path, rate: resultAmount / amount }
      }
    }
  } catch (error) {
    console.log('Error in getting market order result: ', error)
  }

  return { path: [], rate: 0 }
}
