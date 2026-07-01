import { ref, computed } from "vue";

import type { IUser } from "../domain/IUser";
import { userStorage } from "../infrastructure/indexedDb/userStorage";
import { loadUsersUseCase } from "../application/use-cases/loadUsersUseCase";

const users = ref<IUser[]>([]);
const selectedUser = ref<IUser | null>(null);

export const useUserStore = () => {
  const usersIsEmpty = computed(() => users.value.length === 0);

  const loadUsers = async () => {
    try {
      await loadUsersUseCase();
    } catch (error) {
      console.error("Failed to load users", error);
    }

    users.value = await userStorage.getAll();
  };

  const selectUser = (userId: string | null) => {
    if (!userId) {
      selectedUser.value = null;
      return;
    }

    selectedUser.value = users.value.find((u) => u.id === userId) ?? null;
  };

  const getUserById = (id: string) => {
    return users.value.find((u) => u.id === id) ?? null;
  };

  const getUserByName = (name: string) => {
    return (
      users.value.find((u) => u.name.toLowerCase() === name.toLowerCase()) ??
      null
    );
  };

  return {
    users,
    selectedUser,

    loadUsers,
    selectUser,

    getUserById,
    getUserByName,

    usersIsEmpty,
  };
};
