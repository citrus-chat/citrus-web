export class MissingConversationKeyError extends Error {
  constructor(conversationId: string, keyVersion?: number) {
    const suffix = keyVersion !== undefined ? ` version ${keyVersion}` : "";

    super(
      `Conversation key not found for conversation ${conversationId}${suffix}`,
    );

    this.name = "MissingConversationKeyError";

    Object.setPrototypeOf(this, MissingConversationKeyError.prototype);
  }
}

export function isMissingConversationKeyError(
  error: unknown,
): error is MissingConversationKeyError {
  return error instanceof MissingConversationKeyError;
}
