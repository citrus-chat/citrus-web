import type { IChatRoom } from "./IChatRoom";

export interface IChatStorage {
  save(chatRoom: IChatRoom): Promise<void>;

  getById(id: string): Promise<IChatRoom | null>;

  getAll(): Promise<IChatRoom[]>;

  remove(id: string): Promise<void>;

  exists(id: string): Promise<boolean>;
}