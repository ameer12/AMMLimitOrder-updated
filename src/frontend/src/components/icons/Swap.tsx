import React, { SVGProps } from "react";


function Swap({ selected, ...props }: SVGProps<SVGSVGElement>&{selected? :boolean}) {
  return <svg
    xmlns="http://www.w3.org/2000/svg"
    width={15.001}
    height={20.001}
    {...props}
  >
    <path
      d="m10.707.293 4 4a1 1 0 0 1 .084 1.32l-.083.094-4 4.005a1 1 0 0 1-1.5-1.319l.083-.094 2.292-2.298H1a1 1 0 0 1-.993-.883L0 5.001a1 1 0 0 1 .883-.993L1 4.001h10.59l-2.3-2.294a1 1 0 0 1-.084-1.32l.083-.094a1 1 0 0 1 1.32-.084l.094.083 4 4Zm4.283 14.591.01.117a1 1 0 0 1-.883.993l-.117.007H3.413l2.294 2.293a1 1 0 0 1 .084 1.32l-.083.094a1 1 0 0 1-1.32.084l-.094-.083-4-4a1 1 0 0 1-.084-1.32l.083-.094 4-4a1 1 0 0 1 1.5 1.319l-.083.094-2.293 2.293H14a1 1 0 0 1 .993.883l.007.117Z"
      fill={selected?"#ffffff":"#303757"}
    />
  </svg>;
}

export default Swap;
