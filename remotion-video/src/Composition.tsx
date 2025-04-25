import * as React from 'react';
import { AbsoluteFill } from 'remotion';

export const MyComposition = () => {
  return (
    <AbsoluteFill
      style={{ backgroundColor: 'blue', justifyContent: 'center', alignItems: 'center' }}
    >
      <h1 style={{ color: 'white' }}>Hello ClipForge!</h1>
    </AbsoluteFill>
  );
};
