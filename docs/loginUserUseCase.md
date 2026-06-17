# Documento técnico — Login + Registro de Dispositivo Criptográfico

## Fecha

2026-06-16

---

# 1. Objetivo

Permitir que un usuario inicie sesión desde un cliente móvil o web y, simultáneamente, registrar un dispositivo criptográfico asociado a dicha sesión.

Cada dispositivo posee su propio par de claves X25519 utilizado posteriormente para establecer secretos compartidos con otros dispositivos y habilitar mensajería cifrada extremo a extremo (E2E).

---

# 2. Tecnologías utilizadas

## Criptografía

### X25519

Utilizada para:

- Generación de identidad criptográfica del dispositivo
- Intercambio de claves (ECDH)
- Derivación de secretos compartidos

Implementación:

### Web

```text
WebCrypto API
crypto.subtle
```

### Mobile

Implementar utilizando la librería criptográfica nativa correspondiente:

```text
Android:
- Tink
- Conscrypt
- Bouncy Castle

iOS:
- CryptoKit
```

Requisito:

```text
Compatibilidad X25519
```

---

## Persistencia local

### Web

```text
IndexedDB
```

Almacena:

- Device
- Identity Key Pair
- Conversation Keys

### Mobile

Persistencia equivalente:

```text
Android:
EncryptedSharedPreferences
o SQLCipher

iOS:
Keychain
```

---

# 3. Modelo criptográfico

Cada dispositivo genera localmente:

```text
Private Key (X25519)
Public Key (X25519)
```

Ejemplo conceptual:

```text
Device A

Private Key
Public Key
```

La clave privada:

```text
NUNCA abandona el dispositivo
```

La clave pública:

```text
SE ENVÍA AL BACKEND
```

para que otros dispositivos puedan iniciar conversaciones.

---

# 4. Flujo completo de Login

## Paso 1

Usuario ingresa:

```text
email
password
```

---

## Paso 2

Cliente ejecuta:

```typescript
getOrCreateDeviceUseCase();
```

---

## Paso 3

Verificar si existe dispositivo local.

### Existe

```text
Reutilizar Device
```

### No existe

Generar nuevo dispositivo.

---

## Paso 4

Generación de identidad criptográfica

### Web

```typescript
crypto.subtle.generateKey(
  {
    name: "X25519",
  },
  true,
  ["deriveBits"],
);
```

Resultado:

```text
Public Key
Private Key
```

---

## Paso 5

Persistencia local

Guardar:

```text
Private Key
Public Key
DeviceId
```

La clave privada nunca se transmite.

---

## Paso 6

Construcción del LoginRequest

```json
{
  "email": "admin@citruschat.com",
  "password": "Admin123!",
  "device": {
    "deviceId": "6d97e86d-ef24-4b42-9353-f61fffde9379",
    "deviceName": "Google Chrome Web",
    "deviceType": "WEB",
    "publicKey": "BASE64..."
  }
}
```

---

## Paso 7

Envío al Backend

```text
POST /auth/login
```

---

## Paso 8

Backend autentica usuario

```text
Email + Password
```

---

## Paso 9

Backend registra dispositivo

Asocia:

```text
User
↓
Device
↓
Public Key
```

Persistencia sugerida:

```java
UserDevice

id
userId
deviceId
deviceName
deviceType
publicKey
createdAt
```

---

## Paso 10

Backend devuelve sesión

```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

---

# 5. Logout

Cuando el usuario realiza logout:

```text
DELETE Device
```

y posteriormente:

```text
Eliminar Device local
Eliminar Identity Key local
Eliminar Conversation Keys
Eliminar Tokens
```

---

# 6. Refresh Token

Cuando expira el Access Token:

```text
Refresh Token
```

NO debe generar:

```text
Nuevo Device
```

NO debe generar:

```text
Nuevas Claves
```

Debe mantenerse la identidad criptográfica existente.

---

# 7. Interfaces compartidas

## Device

```typescript
export interface IDevice {
  deviceId: string;
  deviceName: string;
  deviceType: "WEB" | "MOBILE";
  publicKey: string;
}
```

---

## DevicePublicKey

Utilizada posteriormente para mensajería E2E.

```typescript
export interface IDevicePublicKey {
  userId: string;
  deviceId: string;
  publicKey: string;
}
```

---

# 8. Garantías de seguridad

## El backend conoce

```text
UserId
DeviceId
PublicKey
```

---

## El backend NO conoce

```text
PrivateKey
Shared Secrets
Conversation Keys
```

---

## El backend NO puede

```text
Descifrar mensajes
```

---

# 9. Próximo paso

Una vez que ambos clientes (Web y Mobile) implementen este flujo:

```text
X25519 Key Generation
```

se podrá implementar:

```text
ECDH (X25519)
↓
Shared Secret
↓
HKDF
↓
AES-256-GCM
↓
Mensajería E2E
```

manteniendo compatibilidad total entre Web y Mobile.
