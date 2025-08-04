import { useEditor } from '@craftjs/core';
import cx from 'classnames';
import React, { useEffect } from 'react';

import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Toolbox } from './Toolbox';

export const Viewport: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const {
    enabled,
    connectors,
    actions: { setOptions },
  } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  useEffect(() => {
    if (!window) return;

    window.requestAnimationFrame(() => {
      window.parent.postMessage({ LANDING_PAGE_LOADED: true }, '*');

      setTimeout(() => {
        setOptions((options) => {
          options.enabled = true;
        });
      }, 200);
    });
  }, [setOptions]);

  return (
    <div className="viewport flex flex-col" style={{ height: 'calc(100vh - 60px)' }}>
      <div className={cx(['flex h-full overflow-hidden flex-row w-full'])}>
        <Toolbox />

        <div className="page-container flex flex-1 h-full flex-col">
          <Header />
          <div
            className={cx([
              'craftjs-renderer flex-1 w-full transition pb-8 overflow-y-auto',
              {
                'bg-renderer-gray': enabled,
              },
            ])}
            ref={(ref) => {
              if (ref) {
                connectors.select(connectors.hover(ref, ''), '');
              }
            }}
          >
            <div className="relative flex flex-col items-center pt-8">
              {children}
            </div>
          </div>
        </div>
        <Sidebar />
      </div>
    </div>
  );
};
