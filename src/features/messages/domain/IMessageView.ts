import type { IMessage } from "./IMessage";
import type { IUserResponse } from "@/features/chat/domain/IUserResponse";

export interface IMessageView extends IMessage {
  sender?: IUserResponse;
}
