const { MessageType } = require("@adiwajshing/baileys")

async function handleMessages(message, conn) {
  try {
    const from = message.key.remoteJid
    const msgContent = message.message?.conversation || message.message?.extendedTextMessage?.text

    if (!msgContent) return

    console.log(`📩 Pesan dari ${from}: ${msgContent}`)

    // Contoh respon otomatis
    if (msgContent.toLowerCase() === "halo") {
      await conn.sendMessage(from, "Hai juga! Ada yang bisa dibantu?", MessageType.text)
    }
  } catch (error) {
    console.error("❌ Error di handleMessages:", error)
  }
}

module.exports = { handleMessages }
