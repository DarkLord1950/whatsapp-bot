/* Copyright (C) 2020 Yusuf Usta.

Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.

WhatsAsena - Yusuf Usta
*/

console.log("📦 Bot.js is starting...")
const fs = require("fs")
const path = require("path")
const { handleMessages } = require("./Utilis/msg")
const chalk = require("chalk")
const { DataTypes } = require("sequelize")
const config = require("./config")
const { WAConnection, MessageType } = require("@adiwajshing/baileys")
const { StringSession } = require("./Utilis/whatsasena")
const { getJson } = require("./Utilis/download")
const { customMessageScheduler } = require("./Utilis/schedule")
const { prepareGreetingMedia } = require("./Utilis/greetings")
const { groupMuteSchuler, groupUnmuteSchuler } = require("./Utilis/groupmute")
const { PluginDB } = require("./plugins/sql/plugin")
const got = require("got")
const { startMessage, waWebVersion } = require("./Utilis/Misc")

const WhatsAsenaDB = config.DATABASE.define("WhatsAsena", {
  info: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
})

fs.readdirSync("./plugins/sql/").forEach((plugin) => {
  if (path.extname(plugin).toLowerCase() == ".js") {
    require("./plugins/sql/" + plugin)
  }
})

String.prototype.format = function () {
  var i = 0,
    args = arguments
  return this.replace(/{}/g, function () {
    return typeof args[i] != "undefined" ? args[i++] : ""
  })
}

if (!Date.now) {
  Date.now = function () {
    return new Date().getTime()
  }
}

Array.prototype.remove = function () {
  var what,
    a = arguments,
    L = a.length,
    ax
  while (L && this.length) {
    what = a[--L]
    while ((ax = this.indexOf(what)) !== -1) {
      this.splice(ax, 1)
    }
  }
  return this
}

async function whatsAsena(version) {
  await config.DATABASE.sync()
  let StrSes_Db = await WhatsAsenaDB.findAll({
    where: { info: "StringSession" },
  })

  const conn = new WAConnection()
  conn.version = version
  const Session = new StringSession()
  conn.logger.level = config.DEBUG ? "debug" : "warn"
  let nodb = false

  if (StrSes_Db.length < 1 || config.CLR_SESSION) {
    nodb = true
    conn.loadAuthInfo(Session.deCrypt(config.SESSION))
  } else {
    conn.loadAuthInfo(Session.deCrypt(StrSes_Db[0].dataValues.value))
  }

  conn.on("connecting", () => {
    console.log(`${chalk.red.bgBlack("B")}${chalk.green.bgBlack("o")}${chalk.blue.bgBlack("t")}${chalk.yellow.bgBlack("t")}${chalk.white.bgBlack("u")}${chalk.magenta.bgBlack("s")}
${chalk.white.bold.bgBlack("Version:")} ${chalk.red.bold.bgBlack(config.VERSION)}
${chalk.blue.italic.bgBlack("ℹ️ Connecting to WhatsApp... Please wait.")}`)
  })

  conn.on("open", async () => {
    console.log(chalk.green.bold("✅ Login successful!"))
    console.log(chalk.blueBright.italic("⬇️ Installing external plugins..."))

    const authInfo = conn.base64EncodedAuthInfo()
    if (StrSes_Db.length < 1) {
      await WhatsAsenaDB.create({
        info: "StringSession",
        value: Session.createStringSession(authInfo),
      })
    } else {
      await StrSes_Db[0].update({
        value: Session.createStringSession(authInfo),
      })
    }

    let plugins = await PluginDB.findAll()
    for (const plugin of plugins) {
      try {
        if (!fs.existsSync(`./plugins/${plugin.dataValues.name}.js`)) {
          let response = await got(plugin.dataValues.url)
          if (response.statusCode == 200) {
            fs.writeFileSync(`./plugins/${plugin.dataValues.name}.js`, response.body)
            require(`./plugins/${plugin.dataValues.name}.js`)
          }
        }
      } catch (error) {
        console.log(`⚠️ failed to load external plugin: ${plugin.dataValues.name}`)
      }
    }

    fs.readdirSync("./plugins").forEach((plugin) => {
      if (path.extname(plugin).toLowerCase() == ".js") {
        require("./plugins/" + plugin)
      }
    })

    console.log(chalk.green.bold("✅ Plugins installed!"))
    await conn.sendMessage(
      conn.user.jid,
      await startMessage(),
      MessageType.text,
      { detectLinks: false }
    )
  })

  conn.on("close", (e) => console.log("🚫 Connection closed:", e.reason))

  await groupMuteSchuler(conn)
  await groupUnmuteSchuler(conn)
  await customMessageScheduler(conn)

  conn.on("chat-update", (m) => {
    console.log("📩 chat-update event fired!")

    if (!m.hasNewMessage) {
      console.log("⚠️ No new message flag!")
      return
    }

    if (!m.messages || !m.count) {
      console.log("⚠️ No message content or count!")
      return
    }

    const { messages } = m
    const all = messages.all()

    if (all.length === 0) {
      console.log("⚠️ Message list is empty!")
      return
    }

    console.log("📨 New message received:")
    console.log(JSON.stringify(all[0], null, 2))

    try {
      handleMessages(all[0], conn)
    } catch (err) {
      console.log("🚨 Error handling message:", err)
    }
  })

  try {
    await conn.connect()
    console.log("✅ Connected to WhatsApp successfully!")
  } catch (e) {
    if (!nodb) {
      console.log(chalk.red.bold("Eski sürüm stringiniz yenileniyor..."))
      conn.loadAuthInfo(Session.deCrypt(config.SESSION))
      try {
        await conn.connect()
        console.log("✅ Reconnected with old session!")
      } catch (err) {
        console.error("❌ Failed to reconnect:", err)
        return
      }
    } else {
      console.error("❌ Initial connection failed:", e)
    }
  }
}

;(async () => {
  await prepareGreetingMedia()
  whatsAsena(await waWebVersion())
})()