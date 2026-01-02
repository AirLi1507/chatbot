export interface Message {
  role: 'system' | 'assistant' | 'user';
  content: string;
  err?: true
}
