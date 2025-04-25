import { contextBridge, ipcRenderer } from 'electron';
import type { VideoInputProps } from './type/video'; // adapte le chemin si besoin

contextBridge.exposeInMainWorld('electronAPI', {
  generateVideo: (inputProps: VideoInputProps) => ipcRenderer.invoke('generate-video', inputProps),
  openLogFile: () => ipcRenderer.invoke('open-log-file'),
});
