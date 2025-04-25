import * as React from 'react';
import { Composition } from 'remotion';
import { MyComposition } from './Composition';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ClipForge"
        component={MyComposition}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          question: 'Quel est le plus grand océan ?',
          answer: 'Le Pacifique',
        }}
      />
    </>
  );
};
