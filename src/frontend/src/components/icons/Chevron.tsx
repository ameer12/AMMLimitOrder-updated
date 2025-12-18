import React, { SVGProps } from "react";


export default function Chevron({ ...props }: SVGProps<SVGSVGElement>) {
  return <svg
    xmlns="http://www.w3.org/2000/svg"
    width={14.828}
    height={8.414}
    {...props}
  >
    <path
      d="m1.414 1.414 6 6 6-6"
      fill="none"
      stroke="#303757"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>;
}

