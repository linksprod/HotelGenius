
export interface UserInfo {
  firstName?: string;
  lastName?: string;
  roomNumber?: string;
  avatar?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface Message {
  id: string | number;
  text: string;
  time: string;
  sender: 'user' | 'staff';
  status?: 'sent' | 'delivered' | 'read';
  type?: 'chat' | 'request';
  requestType?: string;
  requestStatus?: string;
}

export interface Chat {
  id: string;
  userId: string;
  userName: string;
  roomNumber?: string;
  lastActivity: string;
  messages: Message[];
  unread: number;
  userInfo?: UserInfo;
  type?: 'chat' | 'request';
}
