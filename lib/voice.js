// Browser voice helpers for the chats.
// STT: the backend sends the upload to Groq Whisper as "audio.wav", so recordings are converted to
// real 16 kHz mono WAV here (browsers record webm/opus or mp4) before base64 encoding.
// TTS: /api/tts/synthesize returns base64 MP3.

export const canRecord = () =>
  typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof window.MediaRecorder !== 'undefined'

// Starts recording. Resolves to { stop(): Promise<Blob>, cancel() }.
export async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
  const recorder = new MediaRecorder(stream)
  const chunks = []
  recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data)
  recorder.start()
  const release = () => stream.getTracks().forEach((t) => t.stop())

  return {
    stop: () =>
      new Promise((resolve) => {
        recorder.onstop = () => {
          release()
          resolve(new Blob(chunks, { type: recorder.mimeType || 'audio/webm' }))
        }
        recorder.stop()
      }),
    cancel: () => {
      recorder.onstop = release
      if (recorder.state !== 'inactive') recorder.stop()
      else release()
    },
  }
}

function encodeWav(samples, sampleRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2)
  const view = new DataView(buffer)
  const write = (offset, s) => [...s].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)))
  write(0, 'RIFF')
  view.setUint32(4, 36 + samples.length * 2, true)
  write(8, 'WAVE')
  write(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, 1, true) // mono
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  write(36, 'data')
  view.setUint32(40, samples.length * 2, true)
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true)
  }
  return buffer
}

// Any recorded Blob → base64 of a 16 kHz mono WAV
export async function blobToWavBase64(blob) {
  const Ctx = window.AudioContext || window.webkitAudioContext
  const ctx = new Ctx()
  try {
    const decoded = await ctx.decodeAudioData(await blob.arrayBuffer())
    const rate = 16000
    const offline = new OfflineAudioContext(1, Math.ceil(decoded.duration * rate), rate)
    const src = offline.createBufferSource()
    src.buffer = decoded
    src.connect(offline.destination)
    src.start()
    const rendered = await offline.startRendering()
    const bytes = new Uint8Array(encodeWav(rendered.getChannelData(0), rate))
    let binary = ''
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000))
    return { base64: btoa(binary), seconds: decoded.duration }
  } finally {
    ctx.close()
  }
}

// Plays one TTS clip at a time. play() resolves false if the browser blocked autoplay.
export function createSpeaker() {
  let audio = null
  return {
    async play(base64Mp3, { onEnd } = {}) {
      this.stop()
      audio = new Audio(`data:audio/mpeg;base64,${base64Mp3}`)
      audio.onended = () => { audio = null; onEnd?.() }
      try {
        await audio.play()
        return true
      } catch {
        audio = null
        return false
      }
    },
    stop() {
      if (audio) { audio.pause(); audio = null }
    },
  }
}
