import * as React from 'react';
import type { SVGProps } from 'react';
const SvgRadialChart = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={800} height={800} viewBox="0 0 32 32" {...props}>
    <path d="M16 30A14.016 14.016 0 0 1 2 16h2A12 12 0 1 0 16 4V2a14 14 0 0 1 0 28" />
    <path d="M16 26A10.01 10.01 0 0 1 6 16h2a8 8 0 1 0 8-8V6a10 10 0 0 1 0 20" />
    <path d="M16 22a6.007 6.007 0 0 1-6-6h2a4 4 0 1 0 4-4v-2a6 6 0 0 1 0 12" />
    <path
      d="M0 0h32v32H0z"
      data-name="&lt;Transparent Rectangle&gt;"
      style={{
        fill: 'none',
      }}
    />
  </svg>
);
export default SvgRadialChart;
