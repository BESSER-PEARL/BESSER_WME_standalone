import * as React from 'react';
import type { SVGProps } from 'react';
const SvgText = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} {...props}>
    <path fill="none" d="M0 0h24v24H0z" />
    <path d="M5 5v14h14V5zM4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1m9 7v7h-2v-7H7V8h10v2z" />
  </svg>
);
export default SvgText;
