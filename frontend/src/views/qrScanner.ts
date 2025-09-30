import { Html5QrcodeScanner, type Html5QrcodeResult } from "html5-qrcode"
import type { Html5QrcodeError } from "html5-qrcode/core.js"

export type QrScanner = {
  start: () => void
  stop: () => Promise<void>
  isActive: () => boolean
}

export function createQrScanner(containerId: string, onSuccess?: (text: string, result: Html5QrcodeResult) => void): QrScanner {
  let qr: Html5QrcodeScanner | null = null

  const start = () => {
    if (qr) return
    qr = new Html5QrcodeScanner(containerId, { fps: 10, qrbox: { width: 250, height: 250 } }, false)
    qr.render(
      (decodedText: string, result: Html5QrcodeResult) => {
        onSuccess?.(decodedText, result)
        qr?.clear().catch(() => {}).finally(() => { qr = null })
      },
      (errorMessage: string, error: Html5QrcodeError) => {
        console.log(`Error: ${errorMessage}`, error)
      }
    )
  }

  const stop = async () => {
    if (!qr) return
    try {
      await qr.clear()
    } catch (e) {
      console.warn("Failed to clear QR reader", e)
    } finally {
      qr = null
    }
  }

  const isActive = () => !!qr

  return { start, stop, isActive }
}
