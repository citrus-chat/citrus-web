┌──────────────────────────────────────────────────────────────┐
│ CU-XX — GENERAR CONVERSATION KEY │
└──────────────────────────────────────────────────────────────┘

OBJETIVO

Generar una clave simétrica para una conversación y almacenarla
localmente para permitir el cifrado y descifrado de mensajes.

───────────────────────────────────────────────────────────────

ACTOR PRINCIPAL

- Sistema

───────────────────────────────────────────────────────────────

PRECONDICIONES

- Existe una ChatRoom válida.
- El almacenamiento local se encuentra disponible.
- El servicio criptográfico se encuentra disponible.

───────────────────────────────────────────────────────────────

DISPARADOR

Se crea una nueva conversación (ChatRoom).

───────────────────────────────────────────────────────────────

FLUJO PRINCIPAL

1. Crear ChatRoom

   createChatRoomUseCase()

2. Obtener conversationId

   conversationId = chatRoom.id

3. Generar clave de conversación

   cryptoService.generateConversationKey()

4. Crear ConversationKey

   {
   conversationId,
   keyVersion: 1,
   key,
   createdAt
   }

5. Persistir ConversationKey

   cryptoStorage.saveConversationKey(
   conversationKey
   )

6. Finalizar proceso

   La conversación queda preparada para cifrar mensajes.

───────────────────────────────────────────────────────────────

FLUJOS ALTERNATIVOS

A1. Error durante la generación de clave

Condición:

- El servicio criptográfico falla.

Resultado:

- Se cancela la creación de la clave.
- La conversación queda sin capacidad de cifrado.

────────────────────────────────────────

A2. Error durante la persistencia

Condición:

- No es posible acceder al almacenamiento local.

Resultado:

- Se cancela la persistencia.
- La conversación queda sin clave asociada.

───────────────────────────────────────────────────────────────

POSTCONDICIONES

Éxito:

✓ Existe una ConversationKey asociada al conversationId
✓ La clave posee versión inicial 1
✓ La clave queda disponible para Encrypt()
✓ La clave queda disponible para Decrypt()

───────────────────────────────────────────────────────────────

ENTIDADES INVOLUCRADAS

ChatRoom

{
id,
type,
name,
createdAt,
...
}

────────────────────────────────────────

ConversationKey

{
conversationId,
keyVersion,
key,
createdAt
}

───────────────────────────────────────────────────────────────

SERVICIOS INVOLUCRADOS

CryptoService

Responsabilidades:

- Generar claves aleatorias.
- Proveer material criptográfico para AES-GCM.

Método utilizado:

generateConversationKey()

────────────────────────────────────────

CryptoStorage

Responsabilidades:

- Persistir claves de conversación.
- Recuperar claves activas.
- Mantener historial de versiones.

Método utilizado:

saveConversationKey()

───────────────────────────────────────────────────────────────

REGLAS DE NEGOCIO

RN-01

Toda conversación debe poseer una ConversationKey antes de
permitir el envío de mensajes.

RN-02

La primera clave de una conversación debe iniciar con:

keyVersion = 1

RN-03

La clave debe ser generada mediante un generador criptográficamente
seguro.

RN-04

La clave debe almacenarse únicamente en el cliente.

RN-05

La clave nunca debe incluirse dentro de Message.

RN-06

La clave nunca debe almacenarse dentro de EncryptedMessage.

───────────────────────────────────────────────────────────────

ESTADO ACTUAL DE IMPLEMENTACIÓN

[✓] Generación de ConversationKey
[✓] Persistencia local
[✓] Obtención de clave activa
[✓] Versionado de claves
[✓] Integración con SendMessage

[ ] Sincronización de claves entre dispositivos
[ ] Backup de claves
[ ] Rotación automática de claves
[ ] Recuperación de claves desde servidor
