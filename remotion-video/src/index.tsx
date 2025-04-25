import * as React from 'react';

import { registerRoot } from 'remotion';
import { RemotionRoot } from './RemotionRoot';

(window as any).remotionLoaded = true;

registerRoot(() => {
  return <RemotionRoot />;
});