import type { OutgoingQueueItemType } from "./OutgoingQueueItemType";

export interface IOutgoingQueueItem {
  id: string;
  type: OutgoingQueueItemType;
  payload: unknown;
  createdAt: string;
}
