// src/types/video.ts

export type DurationOption = "30-45" | "45-60" | "60-90";
export type VoiceOption =
  | "alloy"
  | "echo"
  | "fable"
  | "onyx"
  | "nova"
  | "shimmer";
// export type MusicOption = "BladeRunner" | "Snowfall" | "Another Love" | "Else-Paris"

export interface VideoApiResponse {
  job_id: string;
  status: string;
  output_path: string;
  error: string | null;
  video_details: Record<string, any>;
}

export interface JobStatusResponse {
  status: string;
  video_url?: string;
  raw_video_url?: string;
  captioned_video_url?: string;
  output_path?: string;
  error?: string;
}

export interface SharedVideoProps {
  duration: DurationOption;
  setDuration: (value: DurationOption) => void;
  voice: VoiceOption;
  setVoice: (value: VoiceOption) => void;
  generated: boolean;
  setGenerated: (value: boolean) => void;
  videoUrl: string;
  setVideoUrl: (value: string) => void;
  error: string;
  setError: (value: string) => void;
  loading: boolean;
  setLoading: (value: boolean) => void;
}

export type FontName =
  | "Anton"
  | "Bangers"
  | "BebasNeue"
  | "impact"
  | "Knewave"
  | "LeagueSpartan"
  | "Montserrat"
  | "PoetsenOne"
  | "Poppins";
export type ColorName =
  | "red"
  | "blue"
  | "green"
  | "indigo"
  | "yellow"
  | "white"
  | "black";

export interface VideoFormProps {
  textareaLabel: string;
  textareaPlaceholder: string;
  textareaValue: string;
  onTextareaChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  duration?: DurationOption;
  setDuration?: (value: DurationOption) => void;
  voice?: VoiceOption;
  setVoice?: (value: VoiceOption) => void;
  error?: string;
  onSubmit?: () => void;
  isSubmitDisabled?: boolean;
  loading: boolean;
  title: string;
  description: string;
  fontName: FontName;
  setFontName: (value: FontName) => void;
  fontBaseColor: ColorName;
  setFontBaseColor: (value: ColorName) => void;
  fontHighlightColor: ColorName;
  setFontHighlightColor: (value: ColorName) => void;
}

export interface VideoPreviewProps {
  download: string;
  generated: boolean;
  videoUrl: string;
  loading: boolean;
  onRegenerate: () => void;
}

export interface NarrationApiResponse {
  script: string;
  title: string;
  title_image_prompt: string;
  [key: string]: any;
}

export interface VideoApiResponse {
  url: string;
  [key: string]: any;
}

export type VideoStatus = "processing" | "completed" | "failed";

export interface Video {
  id: string;
  created_at: string;
  user_id: string;
  video_url: string;
  title: string | null;
  description: string | null;
  duration: string;
  status: VideoStatus;
  font_name: string | null;
  base_font_color: string | null;
  highlight_word_color: string | null;
}
