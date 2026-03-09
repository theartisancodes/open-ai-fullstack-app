import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";

const SCRYPT_KEYLEN = 64;
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;

function scryptAsync(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(
      password,
      salt,
      SCRYPT_KEYLEN,
      { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P },
      (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(derivedKey as Buffer);
      }
    );
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derivedKey = await scryptAsync(password, salt);

  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString("hex")}$${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [algorithm, n, r, p, saltHex, hashHex] = storedHash.split("$");

  if (!algorithm || !n || !r || !p || !saltHex || !hashHex || algorithm !== "scrypt") {
    return false;
  }

  const salt = Buffer.from(saltHex, "hex");
  const expectedHash = Buffer.from(hashHex, "hex");

  const derivedKey = (await new Promise((resolve, reject) => {
    scryptCallback(
      password,
      salt,
      expectedHash.length,
      { N: Number(n), r: Number(r), p: Number(p) },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );
  })) as Buffer;

  if (expectedHash.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(expectedHash, derivedKey);
}
