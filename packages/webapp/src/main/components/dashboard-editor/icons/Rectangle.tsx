import * as React from 'react';
import type { SVGProps } from 'react';
const SvgRectangle = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" {...props}>
    <path
      d="M1 2.5v13a.5.5 0 0 0 .5.5h15a.5.5 0 0 0 .5-.5v-13a.5.5 0 0 0-.5-.5h-15a.5.5 0 0 0-.5.5M16 15H2V3h14Z"
      className="rectangle_svg__a"
    />
  </svg>
);
export default SvgRectangle;
