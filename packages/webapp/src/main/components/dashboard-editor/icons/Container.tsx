import * as React from 'react';
import type { SVGProps } from 'react';
const SvgContainer = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} {...props}>
    <path fill="none" d="M0 0h24v24H0z" />
    <path d="M20 16h2v6h-6v-2H8v2H2v-6h2V8H2V2h6v2h8V2h6v6h-2zm-2 0V8h-2V6H8v2H6v8h2v2h8v-2zM4 4v2h2V4zm0 14v2h2v-2zM18 4v2h2V4zm0 14v2h2v-2z" />
  </svg>
);
export default SvgContainer;
