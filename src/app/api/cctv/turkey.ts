import type { CctvCamera } from './types';

const TURKEY_CAMERAS: CctvCamera[] = [
  {
    id: 'tr-istanbul-bosphorus',
    lat: 41.0082,
    lng: 28.9784,
    name: 'Istanbul - Bosphorus Strait Live',
    city: 'Istanbul',
    country: 'Turkey',
    stream_url: 'https://www.youtube.com/embed/g1dG-U4c8aE?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0',
    stream_type: 'iframe',
    source: 'YouTube Live',
  },
  {
    id: 'tr-istanbul-galata',
    lat: 41.0182,
    lng: 28.9734,
    name: 'Istanbul - Eminönü & Galata Bridge',
    city: 'Istanbul',
    country: 'Turkey',
    stream_url: 'https://www.youtube.com/embed/g1dG-U4c8aE?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0',
    stream_type: 'iframe',
    source: 'YouTube Live',
  }
];

export async function fetchTurkeyCameras(): Promise<CctvCamera[]> {
  return TURKEY_CAMERAS;
}

export default TURKEY_CAMERAS;
