import CryptoJS from 'crypto-js'

/**
 * Generate a random AES key
 */
export const generateAESKey = () => {
  return CryptoJS.lib.WordArray.random(256 / 8).toString()
}

/**
 * Encrypt file data with AES-256
 * @param {File} file - File to encrypt
 * @param {string} key - AES key
 * @returns {Promise<{encrypted: Blob, iv: string}>}
 */
export const encryptFile = async (file, key) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const fileData = e.target.result
        const iv = CryptoJS.lib.WordArray.random(128 / 8)
        
        const encrypted = CryptoJS.AES.encrypt(
          CryptoJS.lib.WordArray.create(fileData),
          key,
          {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
          }
        )

        // Convert to Blob
        const encryptedWords = encrypted.ciphertext
        const encryptedArray = new Uint8Array(encryptedWords.sigBytes)
        for (let i = 0; i < encryptedWords.sigBytes; i++) {
          encryptedArray[i] = (encryptedWords.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff
        }

        const encryptedBlob = new Blob([encryptedArray], { type: 'application/octet-stream' })
        
        resolve({
          encrypted: encryptedBlob,
          iv: iv.toString(),
        })
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Decrypt file data
 * @param {Blob} encryptedBlob - Encrypted file blob
 * @param {string} key - AES key
 * @param {string} iv - Initialization vector
 * @returns {Promise<Blob>}
 */
export const decryptFile = async (encryptedBlob, key, iv) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const encryptedData = new Uint8Array(e.target.result)
        const encryptedWords = CryptoJS.lib.WordArray.create(encryptedData)
        
        const encrypted = CryptoJS.lib.CipherParams.create({
          ciphertext: encryptedWords,
        })

        const decrypted = CryptoJS.AES.decrypt(
          encrypted,
          key,
          {
            iv: CryptoJS.enc.Hex.parse(iv),
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
          }
        )

        const decryptedArray = new Uint8Array(decrypted.sigBytes)
        for (let i = 0; i < decrypted.sigBytes; i++) {
          decryptedArray[i] = (decrypted.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff
        }

        const decryptedBlob = new Blob([decryptedArray])
        resolve(decryptedBlob)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = reject
    reader.readAsArrayBuffer(encryptedBlob)
  })
}

/**
 * Hash file data (SHA-256)
 * @param {File|Blob} file - File to hash
 * @returns {Promise<string>} Hex hash
 */
export const hashFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
        resolve(hashHex)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}



