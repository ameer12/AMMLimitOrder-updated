import { useState } from "react"
import { TokenBalanced } from "../../redux/types/tokens";

import "./index.module.scss";

interface IProps {
    label: string;
    value: number;
    token: TokenBalanced|null;
    onChange?: (value: number) => void;
    onSelectToken?: () => void;
    showMax?: boolean;
}

export default function TokenInput({ label, onChange, value, token, onSelectToken, showMax} : IProps) {
    const [token_balance, setToken_balance] = useState(0)

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.currentTarget;
        if (!!onChange && value.match(/^\d*(\.\d+)?$/g)){
          const returnValue = parseFloat(value);
          onChange(Number.isNaN(returnValue) ? 0 : returnValue);
        }
      };

    const handleMaxClick = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        if(onChange && token?.balance){
          onChange(token.balance);
        }
      };

    return(
        <div className="flex flex-col gap-3">
            <div className="flex flex-row justify-between">
                <label>{label}</label>
                <label>Available: </label>
            </div>
            <div className=" rounded-lg bg-[#130F25] border border-[#2B2649] h-11 flex flex-nowrap flex-row items-center gap-3">
                <div className='px-3 py-2 '>
                    <input type="number" className=" text-white w-full bg-[#130F25] outline-none" value={`${value}`} onChange={handleChange} />
                </div>
                <div className='px-3 py-2 border-l-2 border-[#2B2649] h-11 w-full flex flex-row justify-between' onClick={onSelectToken}>
                    <div className="flex flex-row items-center justify-end gap-2 flex-nowrap">
                        { token != null?
                            <img src={token?.logoURI} alt={token.name} className="h-8 w-8 bg-transparent rounded-full" /> : null }
                        <span className="text-white"> { token !== null ? token.symbol: "Select Token"} </span>
                    </div>
                    <span className="flex flex-row text-white items-center select-none">
                        { showMax && token?.balance ? 
                            <small
                                className=" text-white"
                                onClick={handleMaxClick}>MAX
                            </small> : ""
                        }
                        Balance : <b> { token?.balance ?? 0 } </b>
                    </span>
                </div>
            </div> 
        </div>
    )
}