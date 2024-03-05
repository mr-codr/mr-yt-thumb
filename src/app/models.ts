export interface Thumbnail {
  url: string;
  resolution: string;
  width: number;
  height: number;
  name: string;
}

export type GetThumbsEventType = 'loading' | 'result' | 'error';

export interface GetThumbsEvent {
  type: GetThumbsEventType;
  errorMessage?: string;
  thumbnails?: Thumbnail[];
}
