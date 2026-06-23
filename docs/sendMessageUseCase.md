┌──────────────────────────────────────────────────────────────┐
│ CU-XX — SEND MESSAGE │
└──────────────────────────────────────────────────────────────┘

OBJETIVO
Permitir que un usuario envíe un mensaje dentro de una conversación,
almacenándolo localmente, cifrando su contenido y dejándolo preparado
para sincronización futura.

───────────────────────────────────────────────────────────────

ACTOR PRINCIPAL

- Usuario autenticado.

───────────────────────────────────────────────────────────────

PRECONDICIONES

- Existe un dispositivo registrado localmente.
- Existe una conversación (ChatRoom).
- Existe una ConversationKey activa asociada a la conversación.
- El almacenamiento local se encuentra disponible.

───────────────────────────────────────────────────────────────

DISPARADOR

El usuario presiona el botón de enviar mensaje.

───────────────────────────────────────────────────────────────

FLUJO PRINCIPAL

1. Obtener dispositivo actual

   deviceStorage.get()

2. Validar dispositivo

   Si no existe:
   → Finalizar con error.

3. Crear Message

   {
   id,
   conversationId,
   senderDeviceId,
   content,
   createdAt,
   status: "pending"
   }

4. Persistir Message

   messageStorage.save(message)

5. Obtener ConversationKey activa

   cryptoStorage.getActiveConversationKey(
   conversationId
   )

6. Validar ConversationKey

   Si no existe:
   → Finalizar con error.

7. Cifrar contenido

   cryptoService.encrypt(
   message.content,
   conversationKey.key
   )

   Resultado:

   {
   iv,
   ciphertext
   }

8. Crear EncryptedMessage

   {
   id,
   messageId,
   conversationId,
   keyVersion,
   iv,
   ciphertext
   }

9. Persistir EncryptedMessage

   encryptedMessageStorage.save(
   encryptedMessage
   )

10. Crear OutgoingQueueItem

    {
    id,
    encryptedMessageId,
    createdAt
    }

11. Persistir OutgoingQueueItem

    outgoingQueueStorage.save(
    queueItem
    )

12. Retornar resultado

    return message

───────────────────────────────────────────────────────────────

FLUJOS ALTERNATIVOS

A1. Dispositivo inexistente

Condición:

- No existe dispositivo registrado.

Resultado:

- "Current device not found"

────────────────────────────────────────

A2. ConversationKey inexistente

Condición:

- No existe una clave asociada a la conversación.

Resultado:

- "Conversation key not found"

───────────────────────────────────────────────────────────────

POSTCONDICIONES

Éxito:

✓ El mensaje existe en messages
✓ El mensaje cifrado existe en encryptedMessages
✓ Existe una entrada en outgoingQueue
✓ El mensaje queda pendiente de sincronización

───────────────────────────────────────────────────────────────

ENTIDADES INVOLUCRADAS

Message

{
id,
conversationId,
senderDeviceId,
content,
createdAt,
status
}

────────────────────────────────────────

EncryptedMessage

{
id,
messageId,
conversationId,
keyVersion,
iv,
ciphertext
}

────────────────────────────────────────

ConversationKey

{
conversationId,
keyVersion,
key,
createdAt
}

────────────────────────────────────────

OutgoingQueueItem

{
id,
encryptedMessageId,
createdAt
}

───────────────────────────────────────────────────────────────

REGLAS DE NEGOCIO

RN-01
Todo mensaje debe estar asociado a un dispositivo emisor.

RN-02
Todo mensaje debe pertenecer a una conversación existente.

RN-03
Todo mensaje debe cifrarse utilizando la ConversationKey activa.

RN-04
Todo mensaje cifrado debe registrarse en la cola de salida
antes de considerarse enviado.

RN-05
El contenido en texto plano nunca se almacena dentro de
EncryptedMessage.

───────────────────────────────────────────────────────────────

ESTADO ACTUAL DE IMPLEMENTACIÓN

[✓] Creación de Message
[✓] Persistencia local
[✓] Cifrado AES-GCM
[✓] Creación de EncryptedMessage
[✓] Persistencia de EncryptedMessage
[✓] Encolado para sincronización
[ ] Envío a API
[ ] Reintentos automáticos
[ ] Sincronización multi-dispositivo
[ ] Rotación de claves
