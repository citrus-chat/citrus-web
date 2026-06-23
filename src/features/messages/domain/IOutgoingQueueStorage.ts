import type { IOutgoingQueueItem } from "./IOutgoingQueueItem";

export interface IOutgoingQueueStorage {
  save(item: IOutgoingQueueItem): Promise<void>;

  saveMany(items: IOutgoingQueueItem[]): Promise<void>;

  getAll(): Promise<IOutgoingQueueItem[]>;

  remove(id: string): Promise<void>;

  clear(): Promise<void>;
}
