/**
 * Integration tests for Settings API endpoints
 * Tests API key encryption flow
 */
import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { decrypt, encrypt, generateEncryptionKey } from '@/utils/crypto.js'

// Store original env value
const originalEnvKey = process.env.API_KEY_ENCRYPTION_KEY

// Setup and teardown
beforeAll(() => {
  process.env.API_KEY_ENCRYPTION_KEY = generateEncryptionKey()
})

afterAll(() => {
  if (originalEnvKey) {
    process.env.API_KEY_ENCRYPTION_KEY = originalEnvKey
  } else {
    delete process.env.API_KEY_ENCRYPTION_KEY
  }
})

describe('API Key Encryption Integration', () => {
  it('should encrypt an API key for storage', () => {
    const apiKey = 'sk-test-openai-key-abc123xyz'
    const encrypted = encrypt(apiKey)
    expect(encrypted).not.toBe(apiKey)
    expect(encrypted.length).toBeGreaterThan(apiKey.length)
  })

  it('should decrypt a stored API key for use', () => {
    const apiKey = 'sk-anthropic-key-xyz789abc'
    const encrypted = encrypt(apiKey)
    const decrypted = decrypt(encrypted)
    expect(decrypted).toBe(apiKey)
  })

  it('should handle OpenRouter API keys', () => {
    const apiKey = 'sk-or-v1-abc123def456'
    const encrypted = encrypt(apiKey)
    const decrypted = decrypt(encrypted)
    expect(decrypted).toBe(apiKey)
  })

  it('should maintain integrity through storage simulation', () => {
    const originalKey = 'sk-prod-api-key-12345'
    const encryptedForStorage = encrypt(originalKey)
    const storedValue = encryptedForStorage
    const decryptedForUse = decrypt(storedValue)
    expect(decryptedForUse).toBe(originalKey)
  })

  it('should produce different ciphertext for repeated encryption', () => {
    const apiKey = 'sk-test-key'
    const encrypted1 = encrypt(apiKey)
    const encrypted2 = encrypt(apiKey)
    expect(encrypted1).not.toBe(encrypted2)
    expect(decrypt(encrypted1)).toBe(apiKey)
    expect(decrypt(encrypted2)).toBe(apiKey)
  })
})

describe('Encryption Error Cases', () => {
  it('should fail to decrypt tampered data', () => {
    const apiKey = 'sk-test-key'
    const encrypted = encrypt(apiKey)
    const tampered = `X${encrypted.substring(1)}`
    expect(() => decrypt(tampered)).toThrow()
  })

  it('should fail to decrypt invalid base64', () => {
    expect(() => decrypt('not-valid-base64!!!')).toThrow()
  })
})
