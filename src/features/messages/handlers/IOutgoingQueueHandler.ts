import type { IOutgoingQueueItem } from "../domain/IOutgoingQueueItem";

export interface IOutgoingQueueHandler {
  handle(item: IOutgoingQueueItem): Promise<void>;
}
