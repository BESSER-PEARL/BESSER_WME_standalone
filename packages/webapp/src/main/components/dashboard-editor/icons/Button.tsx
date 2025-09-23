import * as React from 'react';
import type { SVGProps } from 'react';
const SvgButton = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" {...props}>
    <path
      d="M13 4H5a5 5 0 0 0 0 10h8a5 5 0 0 0 0-10m0 9.05H5a4.05 4.05 0 0 1 0-8.1h8a4.05 4.05 0 0 1 0 8.1"
      className="button_svg__a"
    />
    <path d="M13 6.05H5a2.95 2.95 0 0 0 0 5.9h8a2.95 2.95 0 0 0 0-5.9" className="button_svg__a" />
  </svg>
);
export default SvgButton;
