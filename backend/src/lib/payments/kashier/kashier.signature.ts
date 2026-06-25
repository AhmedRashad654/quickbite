import { createHmac, timingSafeEqual } from "crypto";

export function buildSignaturePayload(data: Record<string, unknown>, signatureKeys: string[]): string {
    console.log('[Kashier Crypto] buildSignaturePayload started. Keys to sort & map:', signatureKeys);
    
    const result = [...signatureKeys]
        .sort()
        .map((k) => {
            const v = data[k];
            const stringified = v === undefined || v === null ? "" : String(v);
            const piece = `${k}=${encodeURIComponent(stringified)}`;
            console.log(`[Kashier Crypto Map] Key: "${k}", Original Value:`, v, `-> Encoded Piece: "${piece}"`);
            return piece;
        })
        .join("&");

    console.log('[Kashier Crypto] Final Sorted Signature Payload String:', result);
    return result;
}

export function computeWebhookSignature(data: Record<string, unknown>, signatureKeys: string[], secretKey: string): string {
    console.log('[Kashier Crypto] computeWebhookSignature called.');
    const payload = buildSignaturePayload(data, signatureKeys);
    const hashed = createHmac("sha256", secretKey).update(payload, "utf8").digest("hex");
    console.log('[Kashier Crypto] Computed HMAC-SHA256 Hash:', hashed);
    return hashed;
}

export function verifyWebhookSignature(data: Record<string, unknown>, signatureKeys: string[], apiKey: string, providedSignature: string): boolean {
    console.log('[Kashier Crypto] verifyWebhookSignature ENTRY.');
    console.log('[Kashier Crypto] Provided Signature from Header:', providedSignature);
    console.log('[Kashier Crypto] Verification Key Length:', apiKey ? apiKey.length : 0, 'characters');

    if (!providedSignature || typeof providedSignature !== "string") {
        console.error('[Kashier Crypto Error] Provided signature is missing or not a string!');
        return false;
    }

    const expected = computeWebhookSignature(data, signatureKeys, apiKey);
    console.log(`[Kashier Crypto Compare] Expected: ${expected}`);
    console.log(`[Kashier Crypto Compare] Provided: ${providedSignature}`);

    if (expected.length !== providedSignature.length) {
        console.error(`[Kashier Crypto Error] Length mismatch! Expected length: ${expected.length}, Provided length: ${providedSignature.length}`);
        return false;
    }

    try {
        const isMatch = timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(providedSignature, "hex"));
        console.log(`[Kashier Crypto Final Result] Does Signature Match? -> ${isMatch} 🎯`);
        return isMatch;
    } catch (cryptoError) {
        console.error('[Kashier Crypto Error] timingSafeEqual crashed during buffer comparison:', cryptoError);
        return false;
    }
}