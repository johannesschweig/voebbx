export interface AvailabilityInfo {
  libraryName: string;
  libraryId?: string;
  status: string;
  shelfmark?: string;
  distance?: number;
  daysToWait?: number;
}

export interface MediaItem {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  mediaType: string;
  availability?: AvailabilityInfo[];
  loadingDetails?: boolean;
}