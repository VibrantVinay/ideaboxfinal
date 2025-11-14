export enum Category {
  ACADEMICS = 'Academics',
  EVENTS = 'Events',
  FACILITIES = 'Facilities',
  OTHER = 'Other',
}

export enum Status {
  PENDING = 'Pending',
  REVIEWED = 'Reviewed',
  IMPLEMENTED = 'Implemented',
  REJECTED = 'Rejected',
}

export enum SortOption {
  NEWEST = 'Newest',
  MOST_POPULAR = 'Most Popular',
  RANDOM = 'Random',
}

export enum View {
  DASHBOARD = 'Dashboard',
  SUGGESTIONS = 'Suggestions',
  ANALYTICS = 'Analytics',
  LEADERBOARD = 'Leaderboard',
  PROFILE = 'Profile',
  MODERATION = 'Moderation',
}

export type AuthView = 'LOGIN' | 'SIGNUP';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export type Sentiment = 'Positive' | 'Neutral' | 'Negative';

export type ReactionType = '👍' | '❤️' | '💡' | '😂';

export interface Reaction {
  type: ReactionType;
  count: number;
}

export interface Comment {
  id: string;
  text: string;
  timestamp: number;
}

export interface Suggestion {
  id:string;
  title: string;
  description: string;
  category: Category;
  tags: string[];
  status: Status;
  upvotes: number;
  downvotes: number;
  comments: Comment[];
  reactions: Reaction[];
  createdAt: number;
  statusUpdatedAt?: number;
  avatar: string;
  sentiment: Sentiment;
  isAnonymous: boolean;
  isPrivate: boolean;
  author?: {
    id: string;
    name: string;
  };
  isReported?: boolean;
  reportReason?: string;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  type: ToastType;
  message: string;
}

export type ModerationAction = 'DISMISSED' | 'REMOVED';

export interface ModerationLog {
  id: string;
  suggestionId: string;
  suggestionTitle: string;
  action: ModerationAction;
  moderator: {
    id: string;
    name: string;
  };
  timestamp: number;
}