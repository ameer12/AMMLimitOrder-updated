import React, { SVGProps } from "react";


function Arrow({ ...props }: SVGProps<SVGSVGElement>) {
  return <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16.828 16"
    {...props}>
    <g
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    >
      <path data-name="Line 34" d="M8.414 1v14" />
      <path data-name="Path 10" d="m15.414 8-7 7-7-7" />
    </g>
  </svg>;
}

export default Arrow;
