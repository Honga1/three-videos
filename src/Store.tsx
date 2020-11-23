import create from 'zustand/vanilla';
import createStoreHook from 'zustand';

type Recording = {
  blob: Blob;
  url: string;
};

interface Streams {
  video: MediaStream;
  audio: MediaStream;
}

type State = {
  streams: Streams | undefined;
  staticVideos: { start: Blob; middle: Blob; end: Blob } | undefined;
  recordings: { video?: Recording; audio?: Recording };
  fakedRecording: Blob | undefined;
  isPlaybackReady: boolean;
  setStreams: (streams: Streams) => void;
  closeStreams: () => void;
  setVideoRecording: (recording: Recording) => void;
  setStaticVideos: (start: Blob, middle: Blob, end: Blob) => void;
  setFakedRecording: (video: Blob) => void;
  setPlaybackReadiness: (isReady: boolean) => void;
};

export const store = create<State>((set, get) => ({
  streams: undefined,
  recordings: {},
  fakedRecording: undefined,
  staticVideos: undefined,
  isPlaybackReady: false,
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

    set({ streams });
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
    set({ streams: undefined });
  },

  setVideoRecording: (recording) => {
    set({ recordings: { video: recording } });
  },
  setStaticVideos: (start, middle, end) => {
    set({ staticVideos: { start, middle, end } });
  },
  setFakedRecording: (video) => {
    set({ fakedRecording: video });
  },

  setPlaybackReadiness: (isReady: boolean) => set({ isPlaybackReady: isReady }),
}));

export const useStore = createStoreHook(store);
