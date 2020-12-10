import create from 'zustand/vanilla';
import createStoreHook from 'zustand';

type Recording = {
  blob: Blob;
  url: string;
};

interface Files {
  start: HTMLVideoElement;
  middle: HTMLAudioElement;
  end: HTMLVideoElement;
}

type State = {
  audioStream: MediaStream | undefined;
  videoStream: MediaStream | undefined;
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
  setVideoStream: (videoStream: MediaStream) => void;
  setAudioStream: (audioStream: MediaStream) => void;
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

const apiUrl = 'https://three-videos-api.jaeperris.com';
const initialState: NonFunctionProperties<State> = {
  audioStream: undefined,
  videoStream: undefined,
  recordings: {},
  fakedRecording: undefined,
  fakedRecordingPromise: undefined,
  staticFiles: undefined,
  isPlaybackReady: false,
  config: { recordingDuration: 10, apiUrl, webcamScale: 2 },
};

export const store = create<State>((set, get) => ({
  ...initialState,

  setAudioStream: (audioStream) => {
    get().closeStreams();

    audioStream.getTracks().forEach((track) => {
      track.addEventListener('ended', () => {
        get().closeStreams();
      });
    });

    set({ audioStream });
  },
  setVideoStream: (videoStream) => {
    get().closeStreams();

    videoStream.getTracks().forEach((track) => {
      track.addEventListener('ended', () => {
        get().closeStreams();
      });
    });

    set({ videoStream });
  },
  closeStreams: () => {
    const maybeAudio = get().audioStream;
    const maybeVideo = get().videoStream;

    if (maybeAudio) {
      maybeAudio.getTracks().forEach((track) => {
        track.stop();
      });
    }

    if (maybeVideo) {
      maybeVideo.getTracks().forEach((track) => {
        track.stop();
      });
    }

    set({ audioStream: undefined, videoStream: undefined });
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
