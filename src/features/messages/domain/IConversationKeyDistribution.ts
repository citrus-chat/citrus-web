export interface IConversationKeyDistribution {
  conversationId: string;

  keyVersion: number;

  targetDeviceId: string;

  encryptedConversationKey: string;
}
