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

interface Files {
  start: HTMLVideoElement;
  middle: HTMLAudioElement;
  end: HTMLVideoElement;
}

type State = {
  streams: Streams | undefined;
  staticFiles: Files | undefined;
  recordings: { video?: Recording; audio?: Recording };
  fakedRecording: Blob | undefined;
  fakedRecordingPromise: Promise<Blob> | undefined;
  isPlaybackReady: boolean;
  config: {
    recordingDuration: number;
    apiUrl: string;
    webcamScale: number;
  };
  setStreams: (streams: Streams) => void;
  closeStreams: () => void;
  setVideoRecording: (recording: Recording) => void;
  setStaticFiles: ({ start, middle, end }: Files) => void;
  setFakedRecording: (video: Blob) => void;
  setFakedRecordingPromise: (videoPromise: Promise<Blob>) => void;
  setPlaybackReadiness: (isReady: boolean) => void;
  resetState: () => void;
};

type CallbackFunctionVariadic = (...args: never[]) => void;
type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends CallbackFunctionVariadic ? never : K;
}[keyof T];
type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

const apiUrl =
  window.location.href[window.location.href.length - 1] === '/'
    ? window.location.href.slice(0, -1)
    : window.location.href;
const initialState: NonFunctionProperties<State> = {
  streams: undefined,
  recordings: {},
  fakedRecording: undefined,
  fakedRecordingPromise: undefined,
  staticFiles: undefined,
  isPlaybackReady: false,
  config: { recordingDuration: 10, apiUrl, webcamScale: 2 },
};

export const store = create<State>((set, get) => ({
  ...initialState,
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
  setStaticFiles: ({ start, middle, end }) => {
    set({ staticFiles: { start, middle, end } });
  },
  setFakedRecording: (video) => {
    set({ fakedRecording: video });
  },

  setFakedRecordingPromise: (videoPromise) => {
    set({ fakedRecordingPromise: videoPromise });
  },

  setPlaybackReadiness: (isReady: boolean) => set({ isPlaybackReady: isReady }),
  resetState: () => {
    const config = { ...get().config };
    set({ ...initialState, config: { ...config } });
  },
}));

export const useStore = createStoreHook(store);
