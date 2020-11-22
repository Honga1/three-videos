import create from 'zustand/vanilla';
import createStoreHook from 'zustand';

interface Streams {
  video: MediaStream;
  audio: MediaStream;
}

type State = {
  streams: Streams | undefined;
  isUserStreamOn: boolean;
  setStreams: (streams: Streams) => void;
  closeStreams: () => void;
};

export const store = create<State>((set, get) => ({
  streams: undefined,
  isUserStreamOn: false,
  setStreams: (streams: Streams) => {
    get().closeStreams();
    const { audio, video } = streams;

    audio.getTracks().forEach((track) => {
      track.addEventListener('ended', () => {
        get().closeStreams();
      });
    });

    video.getTracks().forEach((track) => {
      track.addEventListener('ended', () => {
        get().closeStreams();
      });
    });

    set({ streams, isUserStreamOn: true });
  },
  closeStreams: () => {
    const maybeStreams = get().streams;
    if (maybeStreams) {
      const { audio, video } = maybeStreams;
      audio.getTracks().forEach((track) => {
        track.stop();
      });
      video.getTracks().forEach((track) => {
        track.stop();
      });
    }
    set({ isUserStreamOn: false });
  },
}));

export const useStore = createStoreHook(store);
