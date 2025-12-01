import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'

/**
 * Get the encryption key from environment variable
 * Generate a new key with: openssl rand -hex 32
 */
function getEncryptionKey(): Buffer {
  const key = process.env.SSN_ENCRYPTION_KEY
  if (!key) {
    throw new Error('SSN_ENCRYPTION_KEY environment variable is not set')
  }
  if (key.length !== 64) {
    throw new Error('SSN_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)')
  }
  return Buffer.from(key, 'hex')
}

/**
 * Encrypt a Social Security Number using AES-256-GCM
 * Returns a string in format: iv:authTag:encrypted
 */
export function encryptSSN(ssn: string): string {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(16)

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(ssn, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag()

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

/**
 * Decrypt a Social Security Number
 * Expects input in format: iv:authTag:encrypted
 */
export function decryptSSN(encryptedData: string): string {
  const key = getEncryptionKey()
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':')

  if (!ivHex || !authTagHex || !encrypted) {
    throw new Error('Invalid encrypted data format')
  }

  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

/**
 * Get masked SSN (last 4 digits only)
 * E.g., "123-45-6789" -> "XXX-XX-6789"
 */
export function maskSSN(ssn: string): string {
  // Remove any formatting
  const digits = ssn.replace(/\D/g, '')
  if (digits.length !== 9) {
    return 'XXX-XX-XXXX'
  }
  return `XXX-XX-${digits.slice(-4)}`
}

/**
 * Format SSN with dashes
 * E.g., "123456789" -> "123-45-6789"
 */
export function formatSSN(ssn: string): string {
  const digits = ssn.replace(/\D/g, '')
  if (digits.length !== 9) {
    return ssn
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
}

/**
 * Validate SSN format (9 digits)
 */
export function isValidSSN(ssn: string): boolean {
  const digits = ssn.replace(/\D/g, '')
  return digits.length === 9
}
