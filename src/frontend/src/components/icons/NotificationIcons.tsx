import React, { SVGProps } from "react";


function Success({ ...props }: SVGProps<SVGSVGElement>) {
  return <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 22.416 22.027"
    {...props}
  >
    <g
      fill="none"
      stroke="#27c5ab"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    >
      <path data-name="Path 41" d="M21.002 10.098v.92a10 10 0 1 1-5.93-9.14" />
      <path data-name="Path 42" d="m21.002 3.018-10 10.01-3-3" />
    </g>
  </svg>;
}

function Failure({ ...props }: SVGProps<SVGSVGElement>) {
  return <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 22.955 20.103"
    {...props}
  >
    <g
      fill="none"
      stroke="#303757"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    >
      <path
        data-name="Path 4"
        d="m9.766 1.963-8.47 14.14a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3l-8.47-14.14a2 2 0 0 0-3.42 0Z"
      />
      <path data-name="Line 5" d="M11.476 7.103v4" />
      <path data-name="Line 6" d="M11.476 15.103h.01" />
    </g>
  </svg>;
}

function Normal({ ...props }: SVGProps<SVGSVGElement>) {
  return <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 22 22"
    {...props}>
    <g
      transform="translate(-1 -1)"
      fill="none"
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    >
      <circle
        data-name="Ellipse 36"
        cx={10}
        cy={10}
        r={10}
        transform="translate(2 2)"
      />
      <path data-name="Line 144" d="M12 16v-4" />
      <path data-name="Line 145" d="M12 8h.01" />
    </g>
  </svg>;
}

const NotificationIcons = {
  Failure,Normal,Success
};

export default NotificationIcons;