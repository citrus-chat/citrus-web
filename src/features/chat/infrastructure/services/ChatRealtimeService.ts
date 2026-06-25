import { Client, type StompSubscription } from "@stomp/stompjs";

class ChatRealtimeService {
  private client: Client | null = null;

  connect(token: string) {
    if (this.client?.active) {
      return;
    }

    this.client = new Client({
      brokerURL: `${import.meta.env.VITE_WS_URL}/ws`,

      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      reconnectDelay: 5000,

      onConnect: () => {
        console.log("WS connected");
      },

      onStompError: (frame) => {
        console.error("STOMP error", frame);
      },
    });

    this.client.activate();
  }

  subscribeToChatRoom(
    chatRoomId: string,
    callback: () => void,
  ): StompSubscription | undefined {
    return this.client?.subscribe(`/topic/chatrooms/${chatRoomId}`, callback);
  }

  disconnect() {
    this.client?.deactivate();
  }
}

export const chatRealtimeService = new ChatRealtimeService();
