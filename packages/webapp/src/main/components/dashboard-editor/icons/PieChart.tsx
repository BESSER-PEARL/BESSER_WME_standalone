import * as React from 'react';
import type { SVGProps } from 'react';
const SvgPieChart = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={800} height={800} viewBox="0 0 24 24" {...props}>
    <path d="M22 10.972h-8.972V2A10.026 10.026 0 0 1 22 10.972M5.682 19.736A10.023 10.023 0 0 0 22 12.977h-9.56Zm5.341-8.176V2a10.023 10.023 0 0 0-6.759 16.318Z" />
  </svg>
);
export default SvgPieChart;
