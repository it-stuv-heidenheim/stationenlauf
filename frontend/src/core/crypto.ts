// import type { Station } from "./types"
//
// export async function sha256hex(text: string): Promise<string> {
//   const data = new TextEncoder().encode(text)
//   const digest = await crypto.subtle.digest("SHA-256", data)
//   return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("")
// }
//
// export async function ensureStationHashes(stations: Station[]): Promise<void> {
//   for (const st of stations) {
//     for (const task of st.tasks) {
//       if (!task.codeHash && task.codePlain != null) {
//         task.codeHash = await sha256hex(String(task.codePlain))
//       }
//     }
//   }
// }
