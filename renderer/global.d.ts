import type { VideoInputProps } from './types/video';

export {};

declare global {
  interface Window {
    electronAPI: {
      generateVideo: (inputProps: VideoInputProps) => Promise<string>;
      openLogFile: () => Promise<void>; 
    };
  }
}
