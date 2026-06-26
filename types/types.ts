export interface AvailabilityInfo {
  branch: string;
  status: string;
  shelfmark?: string;
}

export interface MediaItem {
  id: string;
  title: string;
  author: string;
  mediaType: string;
  availability?: AvailabilityInfo[];
  loadingDetails?: boolean;
}