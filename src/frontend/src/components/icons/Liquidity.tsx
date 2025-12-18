import React, { SVGProps } from "react";


function Liquidity({ selected, ...props }: SVGProps<SVGSVGElement>&{selected? :boolean}) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={18} height={21.319} {...props}>
    <path
      d="m8.995 1 5.66 5.66a8 8 0 1 1-11.31 0Z"
      fill="none"
      stroke={selected?"#ffffff":"#303757"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>;
}

export default Liquidity;
