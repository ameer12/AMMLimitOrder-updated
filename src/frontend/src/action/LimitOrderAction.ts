import axios from "axios"

export const SubmitOrderData = (submitData: any) => {
    console.log("submitData:", submitData);
    axios.post('http://127.0.0.1:3000/api/LimitOrder', submitData)
        .then(response => console.log(response.data))
        .catch(error => console.log(error));
}