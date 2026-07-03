export interface AvailabilityInfo {
  branch: string;
  status: string;
  shelfmark?: string;
  lat?: number;
  lon?: number;
  distance?: number;
  daysToWait?: number;
}

export interface MediaItem {
  id: string;
  title: string;
  author: string;
  mediaType: string;
  availability?: AvailabilityInfo[];
  loadingDetails?: boolean;
}