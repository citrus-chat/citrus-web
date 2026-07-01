import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import type {
  IWebLoginEvent,
  IWebLoginSessionResult,
} from "@/features/auth/login/domain/IWebLoginToken";

const WEB_LOGIN_CONFIRMED = "WEB_LOGIN_CONFIRMED";

type WebLoginHandlers = {
  onConfirmed: (result: IWebLoginSessionResult) => void;
  onError: (message: string) => void;
  onConnected?: () => void;
};

class WebLoginRealtimeService {
  private client: Client | null = null;
  private subscription: StompSubscription | null = null;

  connect(params: {
    token: string;
    tokenHeader: string;
    queue: string;
    handlers: WebLoginHandlers;
  }) {
    this.disconnect();

    this.client = new Client({
      brokerURL: `${import.meta.env.VITE_WS_URL}/ws`,
      connectHeaders: {
        [params.tokenHeader]: params.token,
      },
      reconnectDelay: 0,
      onConnect: () => {
        params.handlers.onConnected?.();
        this.subscription =
          this.client?.subscribe(params.queue, (message) => {
            this.handleMessage(message, params.handlers);
          }) ?? null;
      },
      onStompError: (frame) => {
        params.handlers.onError(
          frame.headers.message || "No se pudo conectar el login por QR.",
        );
      },
      onWebSocketError: () => {
        params.handlers.onError("No se pudo conectar el login por QR.");
      },
    });

    this.client.activate();
  }

  disconnect() {
    this.subscription?.unsubscribe();
    this.subscription = null;
    this.client?.deactivate();
    this.client = null;
  }

  private handleMessage(message: IMessage, handlers: WebLoginHandlers) {
    try {
      const parsed = JSON.parse(message.body) as IWebLoginEvent;
      const eventType = parsed.eventType ?? parsed.event ?? parsed.type;

      if (eventType !== WEB_LOGIN_CONFIRMED) {
        return;
      }

      const result = (parsed.payload ??
        parsed.data ??
        parsed.result ??
        parsed) as IWebLoginSessionResult;
      handlers.onConfirmed(result);
    } catch {
      handlers.onError("No se pudo procesar la confirmacion del login.");
    }
  }
}

export const webLoginRealtimeService = new WebLoginRealtimeService();
