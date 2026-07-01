import { Client, type StompSubscription } from "@stomp/stompjs";

class ChatRealtimeService {
  private client: Client | null = null;

  connect(token: string): Promise<void> {
    if (this.client?.active) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.client = new Client({
        brokerURL: `${import.meta.env.VITE_WS_URL}/ws`,

        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },

        reconnectDelay: 5000,

        onConnect: () => {
          console.log("WS connected");
          resolve();
        },

        onStompError: (frame) => {
          console.error("STOMP error", frame);
          reject(frame);
        },

        onWebSocketError: (event) => {
          console.error("WebSocket error", event);
          reject(event);
        },
      });

      this.client.activate();
    });
  }

  subscribeToChatList(callback: () => void): StompSubscription | undefined {
    return this.client?.subscribe("/topic/chatrooms", callback);
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
