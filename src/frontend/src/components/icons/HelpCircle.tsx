import React, { SVGProps } from "react";


export default function HelpCircle({ ...props }: SVGProps<SVGSVGElement>) {
  return <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 13 13"
    {...props}>
    <g
      transform="translate(-1.5 -1.5)"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle
        data-name="Ellipse 34"
        cx={6}
        cy={6}
        r={6}
        transform="translate(2 2)"
      />
      <path
        data-name="Path 141"
        d="M6.167 6.115a1.763 1.763 0 0 1 3.427.588c0 1.176-1.763 1.763-1.763 1.763"
      />
      <path data-name="Line 143" d="M7.538 11.231h0" />
    </g>
  </svg>;
}
