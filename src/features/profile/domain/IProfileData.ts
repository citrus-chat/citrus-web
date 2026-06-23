//son datos de UI/locales por ahora.
export interface IProfileData {
  userId: string;
  email: string;
  username: string;

  avatarUrl: string | null;

  description: string;

  privacy: "public" | "contacts" | "private";

  privacySettings: {
    showPhone: boolean;
    showEmail: boolean;
    showStatus: boolean;
    showDescription: boolean;
    allowGroupInvites: boolean;
  };
}