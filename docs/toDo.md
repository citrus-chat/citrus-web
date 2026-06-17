## Documento de decisión técnica — E2E Messaging (Web + Mobile)

### Fecha

2026-06-16

---

# 1. Problema

Se requiere implementar mensajería **End-to-End Encrypted (E2E)** entre:

- Cliente móvil (Android/iOS) usando `libsignal-native`
- Cliente web (Vue + Vite)

El objetivo es mantener compatibilidad criptográfica entre ambos clientes.

---

# 2. Restricción técnica encontrada

El paquete `@signalapp/libsignal-client` (v0.96.1):

- No expone un build browser-compatible estable en Vite
- Depende de `node-gyp-build` (native bindings)
- No proporciona `exports` resolubles para entornos web modernos
- No puede ejecutarse directamente en navegador sin fallos de bundling (`PREBUILDS_ONLY`, `process is not defined`)

Conclusión:

> No es viable usar libsignal directamente en el frontend web en el estado actual del proyecto.

---

# 3. Decisión adoptada (Solución A)

Se implementará un esquema E2E compatible basado en:

## ✔ Web: implementación criptográfica compatible (NO libsignal)

El cliente web implementará manualmente el protocolo Signal:

- X3DH (Extended Triple Diffie-Hellman)
- Double Ratchet Algorithm
- Curve25519 via WebCrypto
- Gestión de keys en IndexedDB

---

## ✔ Mobile: libsignal-native

El cliente móvil continuará usando:

- `libsignal-native` oficial
- implementación completa del protocolo Signal

---

## ✔ Backend: relay + PreKey storage (sin criptografía)

El backend será **no confiable criptográficamente**, y solo actuará como:

- Storage de PreKey Bundles públicos
- Distribución de claves públicas
- Relay de mensajes cifrados (WebSocket / HTTP)
- Gestión de dispositivos

---

# 4. Modelo de seguridad

### Propiedades garantizadas

- El backend nunca accede a claves privadas
- El backend nunca descifra mensajes
- Mensajes siempre viajan cifrados extremo a extremo
- Compromiso del backend no rompe confidencialidad histórica

---

# 5. Flujo de sistema

## 5.1 Registro de dispositivo

### Mobile / Web:

1. Generación local de:

   - Identity Key Pair
   - Signed PreKey
   - One-Time PreKeys (batch)

2. Envío al backend SOLO de claves públicas:

```json
{
  "deviceId": "...",
  "identityKeyPublic": "...",
  "signedPreKey": {
    "keyId": 1,
    "publicKey": "...",
    "signature": "..."
  },
  "oneTimePreKeys": [{ "keyId": 1, "publicKey": "..." }]
}
```

---

## 5.2 Inicio de conversación

1. Cliente A solicita PreKeyBundle de B
2. Backend responde con claves públicas de B
3. Cliente A ejecuta X3DH localmente
4. Se deriva shared secret inicial

---

## 5.3 Creación de sesión

Ambos clientes:

- Derivan sesión criptográfica localmente
- Inicializan Double Ratchet state

---

## 5.4 Mensajería

1. Cliente cifra mensaje localmente
2. Backend solo reenvía ciphertext
3. Cliente receptor descifra localmente

---

# 6. Implementación web

## Tecnologías

- WebCrypto API (X25519 / HKDF / HMAC)
- TypeScript implementation del protocolo Signal
- IndexedDB para almacenamiento seguro local

---

## Componentes a construir

### Signal Core (Web)

- `X3DHService`
- `DoubleRatchetService`
- `KeyDerivationService`
- `SessionStore`

---

### Storage

- Identity keys
- Signed prekeys
- Session state
- Prekey cache

---

# 7. Limitaciones aceptadas

- Web y Mobile NO comparten librería, pero sí protocolo
- Implementación web requiere mantenimiento cuidadoso
- Compatibilidad depende de exactitud del protocolo Signal

---

# 8. Riesgos técnicos

- Error en implementación de Double Ratchet rompe compatibilidad total
- Diferencias en encoding (base64 / byte arrays) pueden invalidar sesiones
- Manejo de estados debe ser estrictamente consistente

---

# 9. Justificación de la decisión

- Mantiene E2E real sin depender de libsignal WASM no estable en web
- Permite avance inmediato sin bloqueo de tooling (Vite)
- Mantiene compatibilidad con mobile (libsignal-native)
- Reduce dependencia de bindings nativos no soportados en browser

---

# 10. Próximos pasos (cuando se retome trabajo)

1. Implementar X3DH en TypeScript (WebCrypto)
2. Definir estructura de PreKeyBundle común
3. Diseñar Session model (Double Ratchet state)
4. Integrar backend relay WebSocket
5. Unificar formato de mensajes cifrados

---

# 11. Estado final del sistema

- Mobile: libsignal-native ✔
- Web: Signal protocol compatible (custom implementation) ✔
- Backend: relay + key distribution ✔
- E2E: garantizado por diseño del protocolo ✔
