import React, { SVGProps } from "react";


function Close({ ...props }: SVGProps<SVGSVGElement>) {
  return <svg
    xmlns="http://www.w3.org/2000/svg"
    width={18.828}
    height={18.828}
    {...props}
  >
    <g
      fill="none"
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    >
      <path data-name="Line 295" d="m17.414 1.414-16 16" />
      <path data-name="Line 296" d="m1.414 1.414 16 16" />
    </g>
  </svg>;
}

export default Close;
