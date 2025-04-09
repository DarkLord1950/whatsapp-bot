// File: Utilis/msg.js

exports.handleMessages = async (message, conn) => {
  console.log("✅ handleMessages terpanggil");

  const sender = message.key.remoteJid;
  const msg = message.message?.conversation || 
              message.message?.extendedTextMessage?.text ||
              message.message?.imageMessage?.caption;

  if (!msg) {
    console.log("❌ Pesan tidak dikenali atau kosong.");
    return;
  }

  console.log(`📨 Pesan dari ${sender}: ${msg}`);

  try {
    await conn.sendMessage(sender, { text: `Halo! Bot menerima pesan kamu: "${msg}" 😊` });
    console.log("✅ Balasan sudah dikirim.");
  } catch (err) {
    console.error("🚨 Gagal mengirim balasan:", err);
  }
};
