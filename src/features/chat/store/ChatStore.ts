import { ref, computed } from "vue";

import type { IChatRoom } from "../domain/IChatRoom";
import type { WorkspaceUser } from "../domain/WorkspaceUser";
import {
  mockWorkspaceUsers,
  currentWorkspaceUser,
} from "../infrastructure/mock/workspaceUsers";
import { ChatRoomType } from "../domain/ChatRoomType";
import { chatStorage } from "../infrastructure/indexedDb/chatStorage";
import { useProfileStore } from "@/features/profile/Store/ProfileStore";
import { syncChatsUseCase } from "../application/use-cases/syncChatsUseCase";
import { deviceStorage } from "@/features/device/infraestructure/indexedDb.ts/deviceStorage";
import type { IDevice } from "@/features/device/domain/IDevice";
import { getCurrentUserUseCase } from "@/features/profile/application/use-cases/getCurrentUserUseCase";
import { updateChatRoomNameApi } from "../infrastructure/api/chatApi";
import { getUserApi } from "../infrastructure/api/userApi";
import { cryptoStorage } from "@/features/crypto/infraestructure/indexedDb/cryptoStorage";
import type { IChatPermission } from "../domain/IChatPermission";
import type { IChatRole } from "../domain/IChatRole";
import type { ICreateChatRoleRequest } from "../domain/ICreateChatRoleRequest";
import type { IUpdateChatRoleRequest } from "../domain/IUpdateChatRoleRequest";
import { getParticipantPermissionsUseCase } from "../application/use-cases/getParticipantPermissionsUseCase";
import {
  getUserFriendlyErrorMessage,
  normalizeApiError,
} from "@/core/api/apiErrorMapper";
import {
  CAN_CREATE_ROLE,
  CAN_DELETE_ROLE,
  CAN_MODIFY_CHAT,
  CAN_MODIFY_ROLE,
  canModifyChat,
  canSendMessages,
  isActiveParticipant,
  normalizeRoleIds,
  permissionDeniedMessage,
} from "../utils/groupPermissions";
import { toPlainObject } from "@/core/utils/toPlainObject";
import { updateParticipantRolesUseCase } from "../application/use-cases/updateParticipantRolesUseCase";
import type { IUpdateParticipantRolesResponse } from "../domain/IUpdateParticipantRolesResponse";
import { getChatRolesUseCase } from "../application/use-cases/getChatRolesUseCase";
import { getAvailableChatPermissionsUseCase } from "../application/use-cases/getAvailableChatPermissionsUseCase";
import { createChatRoleUseCase } from "../application/use-cases/createChatRoleUseCase";
import { updateChatRoleUseCase } from "../application/use-cases/updateChatRoleUseCase";
import { deleteChatRoleUseCase } from "../application/use-cases/deleteChatRoleUseCase";

const selectedChat = ref<IChatRoom | null>(null);
const selectedProfileUser = ref<WorkspaceUser | null>(null);

const chats = ref<IChatRoom[]>([]);
const currentUserId = ref<string | null>(null);
const participantPermissionsById = ref<Record<string, IChatPermission[]>>({});
const participantPermissionsLoadingById = ref<Record<string, boolean>>({});
const participantPermissionsErrorById = ref<Record<string, string | null>>({});
const participantRolesSavingById = ref<Record<string, boolean>>({});
const participantRolesErrorById = ref<Record<string, string | null>>({});
const chatRolesByChatRoomId = ref<Record<string, IChatRole[]>>({});
const chatRolesLoadingByChatRoomId = ref<Record<string, boolean>>({});
const chatRolesErrorByChatRoomId = ref<Record<string, string | null>>({});
const availableChatPermissions = ref<IChatPermission[]>([]);
const availableChatPermissionsLoading = ref(false);
const availableChatPermissionsError = ref<string | null>(null);
const chatRoleSavingById = ref<Record<string, boolean>>({});
const chatRoleDeletingById = ref<Record<string, boolean>>({});
const chatRoleErrorById = ref<Record<string, string | null>>({});
const participantPermissionsRequestsById = new Map<
  string,
  Promise<IChatPermission[]>
>();
const participantPermissionsRequestVersionById = new Map<string, number>();
const chatRolesRequestsByChatRoomId = new Map<string, Promise<IChatRole[]>>();
const chatRolesRequestVersionByChatRoomId = new Map<string, number>();
const workspaceUsersById = ref<Record<string, WorkspaceUser | null>>({});
const workspaceUserRequestsById = new Map<
  string,
  Promise<WorkspaceUser | null>
>();
let availableChatPermissionsLoaded = false;
let availableChatPermissionsRequest: Promise<IChatPermission[]> | null = null;

type LoadChatRolesOptions = {
  forceRefresh?: boolean;
  initialRoles?: Record<string, IChatRole> | null;
};

const PARTICIPANT_PERMISSIONS_ERROR_MESSAGE =
  "No se pudieron cargar los permisos del participante.";
const PARTICIPANT_ROLES_ERROR_MESSAGE = "No se pudieron actualizar los roles.";
const CHAT_ROLES_ERROR_MESSAGE = "No se pudieron cargar los roles del grupo.";
const AVAILABLE_CHAT_PERMISSIONS_ERROR_MESSAGE =
  "No se pudieron cargar los permisos disponibles.";
const CHAT_ROLE_SAVE_ERROR_MESSAGE = "No se pudo guardar el rol.";
const CHAT_ROLE_DELETE_ERROR_MESSAGE = "No se pudo eliminar el rol.";
const CREATE_ROLE_SAVING_ID_PREFIX = "new:";

function sortRoles(roles: IChatRole[]): IChatRole[] {
  return [...roles].sort(
    (a, b) => a.priority - b.priority || a.name.localeCompare(b.name),
  );
}

function rolesRecordToArray(
  roles: Record<string, IChatRole> | null | undefined,
): IChatRole[] {
  return roles ? sortRoles(Object.values(roles)) : [];
}

function rolesArrayToRecord(roles: IChatRole[]): Record<string, IChatRole> {
  return Object.fromEntries(
    roles.map((role) => {
      const plainRole = toPlainObject(role);

      return [
        plainRole.id,
        {
          ...plainRole,
          chatPermissions: toPlainObject(plainRole.chatPermissions ?? []),
        },
      ];
    }),
  );
}

function upsertRole(roles: IChatRole[], role: IChatRole): IChatRole[] {
  const nextRoles = roles.some((item) => item.id === role.id)
    ? roles.map((item) => (item.id === role.id ? role : item))
    : [...roles, role];

  return sortRoles(nextRoles);
}

function mapParticipantPermissionsError(error: unknown): string {
  const message = getUserFriendlyErrorMessage(error);

  return message.includes("conectar")
    ? message
    : PARTICIPANT_PERMISSIONS_ERROR_MESSAGE;
}

function mapParticipantRolesError(error: unknown): string {
  const normalized = normalizeApiError(error);

  switch (normalized.statusCode) {
    case 400:
    case 422:
      return "No se pudieron actualizar los roles seleccionados.";
    case 403:
      return "No tenes permisos para asignar roles a participantes.";
    case 404:
      return "No se encontró el grupo o participante.";
    case 409:
      return "No se puede dejar el grupo sin administrador.";
    default:
      return PARTICIPANT_ROLES_ERROR_MESSAGE;
  }
}

function mapLoadError(error: unknown, fallback: string): string {
  const message = getUserFriendlyErrorMessage(error);

  return message.includes("conectar") ? message : fallback;
}

function mapChatRoleSaveError(error: unknown, permissionCode: string): string {
  const normalized = normalizeApiError(error);

  if (normalized.statusCode === 403) {
    return permissionDeniedMessage(permissionCode);
  }

  return mapLoadError(error, CHAT_ROLE_SAVE_ERROR_MESSAGE);
}

function mapChatRoleDeleteError(error: unknown): string {
  const normalized = normalizeApiError(error);

  if (normalized.statusCode === 403) {
    return permissionDeniedMessage(CAN_DELETE_ROLE);
  }

  if (normalized.statusCode === 409 || normalized.statusCode === 422) {
    return "Este rol está asignado a participantes. Elegí un rol de reemplazo.";
  }

  return mapLoadError(error, CHAT_ROLE_DELETE_ERROR_MESSAGE);
}

export const useChatStore = () => {
  const chatsIsEmpty = computed(() => chats.value.length === 0);

  const { loadProfile, setProfile, profile } = useProfileStore();
  const currentUser = computed<WorkspaceUser>(() => ({
    ...currentWorkspaceUser,
    id: currentUserId.value ?? currentWorkspaceUser.id,
    name: profile.value?.username ?? currentWorkspaceUser.name,
    username: profile.value?.username ?? currentWorkspaceUser.username,
    avatar:
      profile.value?.avatarUrl ?? currentWorkspaceUser.avatar ?? undefined,
  }));

  const currentUserParticipant = computed(
    () =>
      selectedChat.value?.participants.find(
        (participant) => participant.userId === currentUser.value.id,
      ) ?? null,
  );

  const currentParticipantPermissions = computed<IChatPermission[]>(() => {
    const participantId = currentUserParticipant.value?.id;

    return participantId
      ? (participantPermissionsById.value[participantId] ?? [])
      : [];
  });

  const initCurrentUser = async () => {
    const user = await getCurrentUserUseCase();
    if (!user) throw new Error("Current user not found");
    setProfile({
      userId: user.userId,
      email: user.email,
      username: user.username,
      avatarUrl: null,
      description: "",
      privacy: "public",

      privacySettings: {
        showPhone: false,
        showEmail: false,
        showStatus: false,
        showDescription: false,
        allowGroupInvites: false,
      },
    });
    await loadProfile(user.userId);
    currentUserId.value = user.userId;
  };

  const findWorkspaceUserById = async (
    id: string,
  ): Promise<WorkspaceUser | null> => {
    const cleanId = id.trim();

    if (!cleanId) {
      return null;
    }

    if (cleanId in workspaceUsersById.value) {
      return workspaceUsersById.value[cleanId] ?? null;
    }

    const pendingRequest = workspaceUserRequestsById.get(cleanId);

    if (pendingRequest) {
      return pendingRequest;
    }

    const request = getUserApi(cleanId)
      .then((user) => {
        const workspaceUser = {
          id: user.id,
          name: user.username,
          username: user.username,
          email: user.email,
          avatar: user.avatar_url ?? undefined,
          status: user.active ? "online" : "offline",
        } satisfies WorkspaceUser;

        workspaceUsersById.value = {
          ...workspaceUsersById.value,
          [cleanId]: workspaceUser,
        };

        return workspaceUser;
      })
      .catch(() => {
        const fallback =
          mockWorkspaceUsers.find((user) => user.id === cleanId) ?? null;

        workspaceUsersById.value = {
          ...workspaceUsersById.value,
          [cleanId]: fallback,
        };

        return fallback;
      })
      .finally(() => {
        workspaceUserRequestsById.delete(cleanId);
      });

    workspaceUserRequestsById.set(cleanId, request);

    return request;
  };

  const isUserProfilePanelOpen = computed(
    () => selectedProfileUser.value !== null,
  );

  const loadChats = async () => {
    await initCurrentUser();
    await initCurrentUser();
    const device: IDevice | null = await deviceStorage.get();
    if (device) {
      try {
        await syncChatsUseCase(device);
      } catch (error) {
        console.error("Failed to sync chats", error);
      }
    }
    chats.value = await chatStorage.getAll();
  };

  const restoreSelectedChat = () => {
    const selectedChatId = localStorage.getItem("selectedChatId");

    if (!selectedChatId) {
      return;
    }

    selectedChat.value =
      chats.value.find((chat) => chat.id === selectedChatId) ?? null;
  };

  const chatExists = (name: string) => {
    return chats.value.some(
      (chat) => chat.name.toLowerCase() === name.toLowerCase(),
    );
  };

  const selectChat = (chatId: string | null) => {
    if (!chatId) {
      selectedChat.value = null;
      localStorage.removeItem("selectedChatId");
      return;
    }

    const chat = chats.value.find((chat) => chat.id === chatId) ?? null;

    selectedChat.value = chat;

    localStorage.setItem("selectedChatId", chatId);
  };

  const openDirectMessage = (user: WorkspaceUser) => {
    const existingChat = chats.value.find(
      (chat) =>
        chat.type === ChatRoomType.DIRECT && chat.name === user.username,
    );

    if (!existingChat) {
      return;
    }

    selectChat(existingChat.id);
  };

  const openUserProfile = (user: WorkspaceUser | null) => {
    if (!user) {
      selectedProfileUser.value = null;
      return;
    }
    selectedProfileUser.value = user;
  };

  const closeUserProfile = () => {
    selectedProfileUser.value = null;
  };

  const findWorkspaceUserByName = (name: string) => {
    return (
      mockWorkspaceUsers.find(
        (user) => user.username.toLowerCase() === name.toLowerCase(),
      ) ?? null
    );
  };

  const canUserWriteInChat = async (chatId: string | undefined) => {
    const chat = chats.value.find((chat) => chat.id === chatId);

    if (!chat || !currentUser.value) return false;

    const conversationKey = await cryptoStorage.getActiveConversationKey(
      chat.id,
    );

    if (!conversationKey) {
      return false;
    }

    const userFoundParticipant = chat?.participants?.find(
      (participant) => participant.userId === currentUser.value.id,
    );

    if (!userFoundParticipant) {
      return false;
    }

    try {
      const userPermissions = await loadParticipantPermissions(
        chat.id,
        userFoundParticipant.id,
      );

      return canSendMessages(userPermissions);
    } catch {
      return false;
    }
  };

  const canEditChat = async (chatId: string | undefined) => {
    const chat = chats.value.find((chat) => chat.id === chatId);

    if (!chat || !currentUser.value) return false;

    const userFoundParticipant = chat?.participants?.find(
      (participant) => participant.userId === currentUser.value.id,
    );

    if (!userFoundParticipant) {
      return false;
    }

    try {
      const userPermissions = await loadParticipantPermissions(
        chat.id,
        userFoundParticipant.id,
      );

      return canModifyChat(userPermissions);
    } catch {
      return false;
    }
  };

  const loadParticipantPermissions = async (
    chatRoomId: string,
    participantId: string,
    options: { force?: boolean } = {},
  ): Promise<IChatPermission[]> => {
    if (!options.force && participantId in participantPermissionsById.value) {
      return participantPermissionsById.value[participantId] ?? [];
    }

    const pendingRequest =
      participantPermissionsRequestsById.get(participantId);
    if (!options.force && pendingRequest) {
      return pendingRequest;
    }

    const requestVersion =
      (participantPermissionsRequestVersionById.get(participantId) ?? 0) + 1;
    participantPermissionsRequestVersionById.set(participantId, requestVersion);

    participantPermissionsLoadingById.value = {
      ...participantPermissionsLoadingById.value,
      [participantId]: true,
    };
    participantPermissionsErrorById.value = {
      ...participantPermissionsErrorById.value,
      [participantId]: null,
    };

    const request = getParticipantPermissionsUseCase(chatRoomId, participantId)
      .then((permissions) => {
        if (
          participantPermissionsRequestVersionById.get(participantId) ===
          requestVersion
        ) {
          participantPermissionsById.value = {
            ...participantPermissionsById.value,
            [participantId]: permissions,
          };
        }

        return permissions;
      })
      .catch((error: unknown) => {
        if (
          participantPermissionsRequestVersionById.get(participantId) ===
          requestVersion
        ) {
          participantPermissionsErrorById.value = {
            ...participantPermissionsErrorById.value,
            [participantId]: mapParticipantPermissionsError(error),
          };
        }

        throw error;
      })
      .finally(() => {
        if (
          participantPermissionsRequestVersionById.get(participantId) ===
          requestVersion
        ) {
          participantPermissionsLoadingById.value = {
            ...participantPermissionsLoadingById.value,
            [participantId]: false,
          };
          participantPermissionsRequestsById.delete(participantId);
        }
      });

    participantPermissionsRequestsById.set(participantId, request);

    return request;
  };

  const getLocalChatRoom = (chatRoomId: string): IChatRoom | null =>
    selectedChat.value?.id === chatRoomId
      ? selectedChat.value
      : (chats.value.find((chat) => chat.id === chatRoomId) ?? null);

  const setChatRoles = (chatRoomId: string, roles: IChatRole[]) => {
    const sortedRoles = sortRoles(roles);

    chatRolesByChatRoomId.value = {
      ...chatRolesByChatRoomId.value,
      [chatRoomId]: sortedRoles,
    };

    return sortedRoles;
  };

  const updateLocalChatRoom = async (
    chatRoomId: string,
    update: (chatRoom: IChatRoom) => IChatRoom,
  ): Promise<IChatRoom | null> => {
    let chatToSave: IChatRoom | null = null;

    chats.value = chats.value.map((chat) => {
      if (chat.id !== chatRoomId) {
        return chat;
      }

      const nextChat = update(chat);
      chatToSave = nextChat;
      return nextChat;
    });

    if (selectedChat.value?.id === chatRoomId) {
      const nextChat = update(selectedChat.value);
      selectedChat.value = nextChat;
      chatToSave = nextChat;
    }

    if (chatToSave) {
      await chatStorage.save(chatToSave);
    }

    return chatToSave;
  };

  const updateLocalChatRoles = async (
    chatRoomId: string,
    roles: IChatRole[],
  ) => {
    const rolesRecord = rolesArrayToRecord(roles);

    await updateLocalChatRoom(chatRoomId, (chatRoom) => ({
      ...chatRoom,
      roles: rolesRecord,
    }));
  };

  const getParticipantsUsingRole = (chatRoomId: string, roleId: string) =>
    (getLocalChatRoom(chatRoomId)?.participants ?? []).filter(
      (participant) =>
        isActiveParticipant(participant) &&
        participant.roleIds.includes(roleId),
    );

  const refreshPermissionsForParticipants = async (
    chatRoomId: string,
    participantIds: string[],
  ) => {
    await Promise.all(
      participantIds.map((participantId) =>
        loadParticipantPermissions(chatRoomId, participantId, {
          force: true,
        }).catch(() => []),
      ),
    );
  };

  const loadChatRoles = async (
    chatRoomId: string,
    options: LoadChatRolesOptions = {},
  ): Promise<IChatRole[]> => {
    const id = chatRoomId.trim();
    const { forceRefresh = false, initialRoles = null } = options;

    if (!id) {
      throw new Error("chatRoomId is required");
    }

    if (!forceRefresh && id in chatRolesByChatRoomId.value) {
      return chatRolesByChatRoomId.value[id] ?? [];
    }

    if (!forceRefresh) {
      const initialRoleList = rolesRecordToArray(initialRoles);
      const localRoles = initialRoleList.length
        ? initialRoleList
        : rolesRecordToArray(getLocalChatRoom(id)?.roles);

      if (localRoles.length > 0) {
        const sortedRoles = setChatRoles(id, localRoles);
        await updateLocalChatRoles(id, sortedRoles);
        return sortedRoles;
      }
    }

    const pendingRequest = chatRolesRequestsByChatRoomId.get(id);
    if (!forceRefresh && pendingRequest) {
      return pendingRequest;
    }

    const requestVersion =
      (chatRolesRequestVersionByChatRoomId.get(id) ?? 0) + 1;
    chatRolesRequestVersionByChatRoomId.set(id, requestVersion);

    chatRolesLoadingByChatRoomId.value = {
      ...chatRolesLoadingByChatRoomId.value,
      [id]: true,
    };
    chatRolesErrorByChatRoomId.value = {
      ...chatRolesErrorByChatRoomId.value,
      [id]: null,
    };

    const request = getChatRolesUseCase(id)
      .then(async (roles) => {
        if (chatRolesRequestVersionByChatRoomId.get(id) !== requestVersion) {
          return sortRoles(roles);
        }

        const sortedRoles = setChatRoles(id, roles);
        await updateLocalChatRoles(id, sortedRoles);
        return sortedRoles;
      })
      .catch((error: unknown) => {
        if (chatRolesRequestVersionByChatRoomId.get(id) === requestVersion) {
          chatRolesErrorByChatRoomId.value = {
            ...chatRolesErrorByChatRoomId.value,
            [id]: mapLoadError(error, CHAT_ROLES_ERROR_MESSAGE),
          };
        }

        throw error;
      })
      .finally(() => {
        if (chatRolesRequestVersionByChatRoomId.get(id) === requestVersion) {
          chatRolesLoadingByChatRoomId.value = {
            ...chatRolesLoadingByChatRoomId.value,
            [id]: false,
          };
          chatRolesRequestsByChatRoomId.delete(id);
        }
      });

    chatRolesRequestsByChatRoomId.set(id, request);

    return request;
  };

  const loadAvailableChatPermissions = async (): Promise<IChatPermission[]> => {
    if (availableChatPermissionsLoaded) {
      return availableChatPermissions.value;
    }

    if (availableChatPermissionsRequest) {
      return availableChatPermissionsRequest;
    }

    availableChatPermissionsLoading.value = true;
    availableChatPermissionsError.value = null;

    availableChatPermissionsRequest = getAvailableChatPermissionsUseCase()
      .then((permissions) => {
        availableChatPermissions.value = permissions;
        availableChatPermissionsLoaded = true;
        return permissions;
      })
      .catch((error: unknown) => {
        availableChatPermissionsError.value = mapLoadError(
          error,
          AVAILABLE_CHAT_PERMISSIONS_ERROR_MESSAGE,
        );

        throw error;
      })
      .finally(() => {
        availableChatPermissionsLoading.value = false;
        availableChatPermissionsRequest = null;
      });

    return availableChatPermissionsRequest;
  };

  const createRole = async (
    chatRoomId: string,
    payload: ICreateChatRoleRequest,
  ): Promise<IChatRole> => {
    const id = chatRoomId.trim();
    const savingId = `${CREATE_ROLE_SAVING_ID_PREFIX}${id}`;

    chatRoleSavingById.value = {
      ...chatRoleSavingById.value,
      [savingId]: true,
    };
    chatRoleErrorById.value = {
      ...chatRoleErrorById.value,
      [savingId]: null,
    };

    try {
      const role = await createChatRoleUseCase(id, payload);
      const currentRoles =
        chatRolesByChatRoomId.value[id] ??
        rolesRecordToArray(getLocalChatRoom(id)?.roles);
      const nextRoles = setChatRoles(id, upsertRole(currentRoles, role));

      await updateLocalChatRoles(id, nextRoles);
      await loadChatRoles(id, { forceRefresh: true }).catch(() => nextRoles);

      return role;
    } catch (error) {
      chatRoleErrorById.value = {
        ...chatRoleErrorById.value,
        [savingId]: mapChatRoleSaveError(error, CAN_CREATE_ROLE),
      };
      throw error;
    } finally {
      chatRoleSavingById.value = {
        ...chatRoleSavingById.value,
        [savingId]: false,
      };
    }
  };

  const updateRole = async (
    chatRoomId: string,
    roleId: string,
    payload: IUpdateChatRoleRequest,
  ): Promise<IChatRole> => {
    const id = chatRoomId.trim();
    const cleanRoleId = roleId.trim();
    const affectedParticipantIds = getParticipantsUsingRole(
      id,
      cleanRoleId,
    ).map((participant) => participant.id);

    chatRoleSavingById.value = {
      ...chatRoleSavingById.value,
      [cleanRoleId]: true,
    };
    chatRoleErrorById.value = {
      ...chatRoleErrorById.value,
      [cleanRoleId]: null,
    };

    try {
      const role = await updateChatRoleUseCase(id, cleanRoleId, payload);
      const currentRoles =
        chatRolesByChatRoomId.value[id] ??
        rolesRecordToArray(getLocalChatRoom(id)?.roles);
      const nextRoles = setChatRoles(id, upsertRole(currentRoles, role));

      await updateLocalChatRoles(id, nextRoles);
      await loadChatRoles(id, { forceRefresh: true }).catch(() => nextRoles);
      await refreshPermissionsForParticipants(id, affectedParticipantIds);

      return role;
    } catch (error) {
      chatRoleErrorById.value = {
        ...chatRoleErrorById.value,
        [cleanRoleId]: mapChatRoleSaveError(error, CAN_MODIFY_ROLE),
      };
      throw error;
    } finally {
      chatRoleSavingById.value = {
        ...chatRoleSavingById.value,
        [cleanRoleId]: false,
      };
    }
  };

  const deleteRole = async (
    chatRoomId: string,
    roleId: string,
    replacementRoleId?: string,
  ): Promise<void> => {
    const id = chatRoomId.trim();
    const cleanRoleId = roleId.trim();
    const cleanReplacementRoleId = replacementRoleId?.trim();
    const affectedParticipantIds = getParticipantsUsingRole(
      id,
      cleanRoleId,
    ).map((participant) => participant.id);

    chatRoleDeletingById.value = {
      ...chatRoleDeletingById.value,
      [cleanRoleId]: true,
    };
    chatRoleErrorById.value = {
      ...chatRoleErrorById.value,
      [cleanRoleId]: null,
    };

    try {
      await deleteChatRoleUseCase(id, cleanRoleId, cleanReplacementRoleId);

      const currentRoles =
        chatRolesByChatRoomId.value[id] ??
        rolesRecordToArray(getLocalChatRoom(id)?.roles);
      const nextRoles = setChatRoles(
        id,
        currentRoles.filter((role) => role.id !== cleanRoleId),
      );
      const rolesRecord = rolesArrayToRecord(nextRoles);

      await updateLocalChatRoom(id, (chatRoom) => ({
        ...chatRoom,
        roles: rolesRecord,
        participants: chatRoom.participants.map((participant) => {
          if (!participant.roleIds.includes(cleanRoleId)) {
            return participant;
          }

          const nextRoleIds = normalizeRoleIds([
            ...participant.roleIds.filter((item) => item !== cleanRoleId),
            ...(cleanReplacementRoleId ? [cleanReplacementRoleId] : []),
          ]);

          return {
            ...participant,
            roleIds: nextRoleIds,
          };
        }),
      }));
      await loadChatRoles(id, { forceRefresh: true }).catch(() => nextRoles);
      await refreshPermissionsForParticipants(id, affectedParticipantIds);
    } catch (error) {
      chatRoleErrorById.value = {
        ...chatRoleErrorById.value,
        [cleanRoleId]: mapChatRoleDeleteError(error),
      };
      throw error;
    } finally {
      chatRoleDeletingById.value = {
        ...chatRoleDeletingById.value,
        [cleanRoleId]: false,
      };
    }
  };

  const updateLocalParticipantRoles = async (
    response: IUpdateParticipantRolesResponse,
  ) => {
    const applyUpdate = (chat: IChatRoom): boolean => {
      const participant = chat.participants.find(
        (item) => item.id === response.participantId,
      );

      if (!participant) {
        return false;
      }

      participant.roleIds = [...response.roleIds];
      return true;
    };

    const chat = chats.value.find((item) => item.id === response.chatRoomId);

    if (chat && applyUpdate(chat)) {
      await chatStorage.save(chat);
    }

    if (selectedChat.value?.id === response.chatRoomId) {
      const nextParticipants = selectedChat.value.participants.map(
        (participant) =>
          participant.id === response.participantId
            ? { ...participant, roleIds: [...response.roleIds] }
            : participant,
      );

      selectedChat.value = {
        ...selectedChat.value,
        participants: nextParticipants,
      };
    }
  };

  const updateParticipantRoles = async (params: {
    chatRoomId: string;
    participantId: string;
    roleIds: string[];
  }): Promise<IUpdateParticipantRolesResponse> => {
    const roleIds = normalizeRoleIds(params.roleIds);

    if (roleIds.length === 0) {
      const message = "Seleccioná al menos un rol.";
      participantRolesErrorById.value = {
        ...participantRolesErrorById.value,
        [params.participantId]: message,
      };
      throw new Error(message);
    }

    participantRolesSavingById.value = {
      ...participantRolesSavingById.value,
      [params.participantId]: true,
    };
    participantRolesErrorById.value = {
      ...participantRolesErrorById.value,
      [params.participantId]: null,
    };

    try {
      const response = await updateParticipantRolesUseCase({
        ...params,
        roleIds,
      });

      await updateLocalParticipantRoles(response);

      participantPermissionsById.value = {
        ...participantPermissionsById.value,
        [response.participantId]: response.permissions,
      };
      participantPermissionsErrorById.value = {
        ...participantPermissionsErrorById.value,
        [response.participantId]: null,
      };

      return response;
    } catch (error) {
      participantRolesErrorById.value = {
        ...participantRolesErrorById.value,
        [params.participantId]: mapParticipantRolesError(error),
      };
      throw error;
    } finally {
      participantRolesSavingById.value = {
        ...participantRolesSavingById.value,
        [params.participantId]: false,
      };
    }
  };

  const updateChatRoomName = async (chatId: string, name: string) => {
    let result;

    try {
      result = await updateChatRoomNameApi(chatId, name);
    } catch (error) {
      if (normalizeApiError(error).statusCode === 403) {
        throw new Error(permissionDeniedMessage(CAN_MODIFY_CHAT), {
          cause: error,
        });
      }

      throw error;
    }

    const chat = chats.value.find((chat) => chat.id === chatId);

    if (chat) {
      chat.name = result.name;
      chat.updatedAt = result.updatedAt;
      await chatStorage.save(chat);
    }

    if (selectedChat.value?.id === chatId) {
      selectedChat.value = { ...selectedChat.value, name: result.name };
    }

    return result;
  };

  return {
    chats,
    selectedChat,
    selectedProfileUser,

    loadChats,
    restoreSelectedChat,

    selectChat,
    chatExists,

    openDirectMessage,

    openUserProfile,
    closeUserProfile,

    initCurrentUser,
    currentUser,
    currentUserParticipant,
    currentParticipantPermissions,
    workspaceUsers: computed(() => mockWorkspaceUsers),

    findWorkspaceUserById,
    findWorkspaceUserByName,

    chatsIsEmpty,
    isUserProfilePanelOpen,

    canUserWriteInChat,
    canEditChat,
    updateChatRoomName,
    participantPermissionsById,
    participantPermissionsLoadingById,
    participantPermissionsErrorById,
    participantRolesSavingById,
    participantRolesErrorById,
    chatRolesByChatRoomId,
    chatRolesLoadingByChatRoomId,
    chatRolesErrorByChatRoomId,
    availableChatPermissions,
    availableChatPermissionsLoading,
    availableChatPermissionsError,
    chatRoleSavingById,
    chatRoleDeletingById,
    chatRoleErrorById,
    loadParticipantPermissions,
    updateParticipantRoles,
    loadChatRoles,
    loadAvailableChatPermissions,
    createRole,
    updateRole,
    deleteRole,
  };
};
