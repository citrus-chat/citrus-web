export interface IChatParticipant {
  id: string;
  chatRoomId: string;
  userId: string;
  roleIds: string[];
  joinedAt?: string | null;
  leftAt?: string | null;
  lastReadMessageId?: string | null;
}
