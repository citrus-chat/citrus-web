import type { IDevice } from "@/features/device/domain/IDevice";
import { generateDeviceName } from "@/features/device/application/generateDeviceName";
import { SignalService } from "@/features/signal/infraestructure/services/SignalService";
import { signalStorage } from "@/features/signal/infraestructure/indexedDb/signalStorage";

const signalService = new SignalService();

export async function generateDeviceUseCase(): Promise<IDevice> {

    const deviceId = crypto.randomUUID();
    const deviceName = generateDeviceName();

    const identityKey = await signalService.generateIdentityKey();
    await signalStorage.saveIdentityKey(identityKey);

    const signedPreKeyId = await signalStorage.nextSignedPreKeyId();
    const signedPreKey = await signalService.generateSignedPreKey(identityKey, signedPreKeyId);
    await signalStorage.saveSignedPreKey(signedPreKey);

    const oneTimePreKeyIds = await signalStorage.getNextOneTimePreKeyIds(100);
    const oneTimePreKeys = await signalService.generateOneTimePreKeys(oneTimePreKeyIds);
    await signalStorage.saveOneTimePreKeys(oneTimePreKeys);

    return {
        deviceId,
        deviceName,
        publicIdentityKey: identityKey,
        signedPreKey,
        oneTimePreKeys,
    };
}