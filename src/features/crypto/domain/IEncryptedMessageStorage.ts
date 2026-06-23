import type { IEncryptedMessage } from "./IEncryptedMessage";

export interface IEncryptedMessageStorage {
  save(message: IEncryptedMessage): Promise<void>;

  saveMany(messages: IEncryptedMessage[]): Promise<void>;

  getById(id: string): Promise<IEncryptedMessage | null>;

  getByConversationId(conversationId: string): Promise<IEncryptedMessage[]>;

  deleteByConversationId(conversationId: string): Promise<void>;
}
