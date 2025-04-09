const chalk = require("chalk")

async function handleMessages(message, conn) {
  try {
    const sender = message.key.remoteJid
    const text = message.message?.conversation || message.message?.extendedTextMessage?.text || ""

    console.log(chalk.yellow(`📥 Pesan dari ${sender}: ${text}`))

    // Contoh respon otomatis
    if (text.toLowerCase() === "halo") {
      await conn.sendMessage(sender, { text: "Halo juga! Ada yang bisa saya bantu?" })
    }
  } catch (error) {
    console.error("❌ Error dalam handleMessages:", error)
  }
}

module.exports = { handleMessages }
