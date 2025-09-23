import * as React from 'react';
import type { SVGProps } from 'react';
const SvgUndo = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} {...props}>
    <path
      d="M15.332 6.271A5.2 5.2 0 0 0 11.835 5H5.5V2.4a.4.4 0 0 0-.4-.4.4.4 0 0 0-.263.1L1.072 5.824a.25.25 0 0 0 0 .35L4.834 9.9a.4.4 0 0 0 .264.1.4.4 0 0 0 .4-.4V7h6.44a3.07 3.07 0 0 1 3.112 2.9 2.945 2.945 0 0 1-2.783 3.098q-.133.007-.267.002H8.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h3.263a5.17 5.17 0 0 0 5.213-4.506 4.97 4.97 0 0 0-1.644-4.223"
      className="undo_svg__a"
    />
  </svg>
);
export default SvgUndo;
