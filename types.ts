export enum Sender {
  User = 'user',
  AI = 'ai'
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: number;
  image?: string; // Base64 string
  isError?: boolean;
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  promptContext: string;
}

export enum AppState {
  Home = 'home',
  Chat = 'chat'
}