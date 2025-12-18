import React, { SVGProps } from "react";


function Info({ selected, ...props }: SVGProps<SVGSVGElement>&{selected? :boolean}) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} {...props}>
    <g
      transform="translate(1 1)"
      fill="none"
      stroke={selected?"#ffffff":"#303757"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    >
      <circle data-name="Ellipse 1" cx={10} cy={10} r={10} />
      <path data-name="Line 1" d="M10 14v-4" />
      <path data-name="Line 2" d="M10 6h.01" />
    </g>
  </svg>;
}

export default Info;
