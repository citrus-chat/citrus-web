import type { IUploadConversationKeyRequest } from "../../domain/IUploadConversationKeyRequest";
import { uploadConversationKeyApi } from "../../infrastructure/api/chatApi";

export async function uploadConversationKeyUseCase(
  request: IUploadConversationKeyRequest,
): Promise<void> {
  const response = await uploadConversationKeyApi(request);

  if (!response?.id) {
    throw new Error("Failed to upload conversation key");
  }
}
