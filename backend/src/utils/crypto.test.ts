/**
 * Tests for AES-256-GCM encryption utilities
 */
import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { decrypt, encrypt, generateEncryptionKey } from './crypto.js'

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

describe('generateEncryptionKey', () => {
  it('should generate a 64-character hex string', () => {
    const key = generateEncryptionKey()
    expect(key).toHaveLength(64)
    expect(/^[0-9a-f]+$/.test(key)).toBe(true)
  })

  it('should generate unique keys each time', () => {
    const key1 = generateEncryptionKey()
    const key2 = generateEncryptionKey()
    expect(key1).not.toBe(key2)
  })
})

describe('encrypt', () => {
  it('should encrypt a string and return base64', () => {
    const plaintext = 'sk-test-api-key-12345'
    const encrypted = encrypt(plaintext)
    expect(typeof encrypted).toBe('string')
    expect(encrypted).not.toBe(plaintext)
    expect(encrypted.length).toBeGreaterThan(plaintext.length)
  })

  it('should produce different ciphertext for same input', () => {
    const plaintext = 'same-api-key'
    const encrypted1 = encrypt(plaintext)
    const encrypted2 = encrypt(plaintext)
    expect(encrypted1).not.toBe(encrypted2)
  })

  it('should handle empty strings', () => {
    const encrypted = encrypt('')
    expect(typeof encrypted).toBe('string')
    expect(encrypted.length).toBeGreaterThan(0)
  })

  it('should handle long strings', () => {
    const longKey = `sk-${'a'.repeat(1000)}`
    const encrypted = encrypt(longKey)
    expect(typeof encrypted).toBe('string')
  })

  it('should handle special characters', () => {
    const specialKey = 'sk-test_key.with/special+chars=123'
    const encrypted = encrypt(specialKey)
    expect(typeof encrypted).toBe('string')
  })
})

describe('decrypt', () => {
  it('should decrypt an encrypted string back to original', () => {
    const plaintext = 'sk-test-api-key-12345'
    const encrypted = encrypt(plaintext)
    const decrypted = decrypt(encrypted)
    expect(decrypted).toBe(plaintext)
  })

  it('should handle empty strings', () => {
    const encrypted = encrypt('')
    const decrypted = decrypt(encrypted)
    expect(decrypted).toBe('')
  })

  it('should handle long strings', () => {
    const longKey = `sk-${'b'.repeat(1000)}`
    const encrypted = encrypt(longKey)
    const decrypted = decrypt(encrypted)
    expect(decrypted).toBe(longKey)
  })

  it('should handle special characters', () => {
    const specialKey = 'sk-test_key.with/special+chars=123'
    const encrypted = encrypt(specialKey)
    const decrypted = decrypt(encrypted)
    expect(decrypted).toBe(specialKey)
  })

  it('should handle unicode characters', () => {
    const unicodeKey = 'sk-test-emoji-key'
    const encrypted = encrypt(unicodeKey)
    const decrypted = decrypt(encrypted)
    expect(decrypted).toBe(unicodeKey)
  })
})

describe('roundtrip encryption', () => {
  it('should roundtrip various key formats', () => {
    const testCases = [
      'sk-proj-abc123',
      'openai-key-with-dashes',
      'anthropic_key_with_underscores',
      'a',
      '1234567890',
      'mixed-Case-KEY-123',
    ]

    for (const testCase of testCases) {
      const encrypted = encrypt(testCase)
      const decrypted = decrypt(encrypted)
      expect(decrypted).toBe(testCase)
    }
  })
})

describe('error handling', () => {
  it('should throw on invalid ciphertext', () => {
    expect(() => decrypt('invalid-base64!')).toThrow()
  })

  it('should throw on truncated ciphertext', () => {
    const encrypted = encrypt('test')
    const truncated = encrypted.substring(0, 10)
    expect(() => decrypt(truncated)).toThrow()
  })

  it('should throw on tampered ciphertext', () => {
    const encrypted = encrypt('test')
    const tampered = `X${encrypted.substring(1)}`
    expect(() => decrypt(tampered)).toThrow()
  })
})
