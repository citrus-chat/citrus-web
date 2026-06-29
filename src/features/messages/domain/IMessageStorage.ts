import type { IMessage } from "./IMessage";

export interface IMessageStorage {
  save(message: IMessage): Promise<void>;

  saveMany(messages: IMessage[]): Promise<void>;

  getByConversationId(conversationId: string): Promise<IMessage[]>;

  countByConversationId(conversationId: string): Promise<number>;
}
