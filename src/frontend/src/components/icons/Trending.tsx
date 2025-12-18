import React, { SVGProps } from "react";


export default function Trending({ ...props }: SVGProps<SVGSVGElement> ) {
  return <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 34.828 20.283"
    {...props}
  >
    <g
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    >
      <path
        data-name="Path 256"
        d="M33.414 1.414 19.596 15.232l-7.273-7.273-10.909 10.91"
      />
      <path data-name="Path 257" d="M24.687 1.414h8.727v8.727" />
    </g>
  </svg>;
}

