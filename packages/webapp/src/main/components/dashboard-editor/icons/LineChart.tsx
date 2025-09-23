import * as React from 'react';
import type { SVGProps } from 'react';
const SvgLineChart = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={800} height={800} viewBox="0 0 24 24" {...props}>
    <path fill="none" d="M0 0h24v24H0z" />
    <path d="M5 3v16h16v2H3V3zm15.293 3.293 1.414 1.414L16 13.414l-3-2.999-4.293 4.292-1.414-1.414L13 7.586l3 2.999z" />
  </svg>
);
export default SvgLineChart;
