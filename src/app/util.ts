import { Observable } from 'rxjs';
import { GetThumbsEvent, Thumbnail } from './models';

export const parseUrl = (url: string) => {
  const baseUrl = 'https://www.youtube.com/watch?v=';
  if (!hasUnsafeCharacter(url)) {
    return baseUrl + url;
  }

  if (!validateYoutubeUrl(url)) {
    throw new Error('Invalid URL or video ID');
  }
  const videoId = getVideoId(url);
  return baseUrl + videoId;
};

const hasUnsafeCharacter = (text: string) => {
  return !!text.match(/[^A-z0-9-._~]/);
};

const validateYoutubeUrl = (url: string) => {
  let urlObj: URL;
  try {
    urlObj = new URL(url);
  } catch {
    return false;
  }

  if (urlObj.protocol !== 'https:' && urlObj.protocol !== 'http:') {
    return false;
  }

  let videoId: string | null;
  switch (urlObj.hostname) {
    case 'www.youtube.com':
    case 'm.youtube.com':
      videoId = urlObj.searchParams.get('v');
      return !!videoId && !hasUnsafeCharacter(videoId) && urlObj.pathname === '/watch';

    case 'youtu.be':
      videoId = urlObj.pathname.slice(1);
      return !hasUnsafeCharacter(videoId);

    default:
      return true;
  }
};

const getVideoId = (url: string) => {
  const objUrl = new URL(url);

  switch (objUrl.hostname) {
    case 'www.youtube.com':
    case 'm.youtube.com':
      return objUrl.searchParams.get('v') ?? '';
    case 'youtu.be':
      return objUrl.pathname.slice(1);
    default:
      throw new Error('Invalid URL or video ID');
  }
};

export const getThumbs = (videoUrl: string): Observable<GetThumbsEvent> => {
  return new Observable<GetThumbsEvent>(subscriber => {
    subscriber.next({ type: 'loading' });

    const thumbNames = [
      'maxresdefault.jpg',
      'sddefault.jpg',
      'hqdefault.jpg',
      '0.jpg',
      'mqdefault.jpg',
      '1.jpg',
      '2.jpg',
      '3.jpg',
      'default.jpg',
    ];

    const thumbPromises = thumbNames.map(thumbName => getThumbnail(videoUrl, thumbName));
    Promise.all(thumbPromises).then(thumbnails =>
      subscriber.next({ type: 'result', thumbnails }),
    );
  });
};

const getThumbnail = (videoUrl: string, thumbName: string): Promise<Thumbnail> => {
  return new Promise(resolve => {
    const url = getBaseThumbUrl(videoUrl) + thumbName;
    const img = new Image();
    img.src = url;
    img.onload = () =>
      resolve({
        url,
        resolution: `${img.width}x${img.height}`,
        width: img.width,
        height: img.height,
        name: thumbName,
      });
  });
};

const getBaseThumbUrl = (videoUrl: string) => {
  return videoUrl.replace('www.youtube', 'i.ytimg').replace('watch?v=', 'vi/').concat('/');
};
