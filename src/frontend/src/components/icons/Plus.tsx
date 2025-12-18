import React, { SVGProps } from "react";


export default function Plus({ ...props }: SVGProps<SVGSVGElement>) {
  return <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    {...props}>
    <g
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    >
      <path data-name="Line 212" d="M8 1v14" />
      <path data-name="Line 213" d="M1 8h14" />
    </g>
  </svg>;
}
