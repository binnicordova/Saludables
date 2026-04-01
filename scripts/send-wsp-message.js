const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js")
const qrcode = require("qrcode-terminal")
const path = require("path")

const imagePath = path.join(__dirname, "../resources/contact/saludables_wsp.png");

const message = ({ name }) => `Hola ${name},

Soy el fundador de Saludables, una app que está atrayendo clientes (familias y turistas) a restaurantes y hoteles en zonas como Lima, playas del sur y Paracas.

Te propongo algo simple:

• Te incluimos GRATIS en la app
• Te enviamos nuevos clientes
• Solo pedimos ofrecer un 10% de descuento a usuarios que muestren la app

No hay costos fijos ni comisiones.

Aquí puedes ver la app:
https://play.google.com/store/apps/details?id=com.saludables.app

Estamos seleccionando pocos aliados por zona para darles mayor visibilidad.

¿Te interesa que te cuente cómo funciona?`

const data = require("./potential_clients_2.json")

const DELAY_MS = Number(process.env.WSP_DELAY_MS || 1500)
const SESSION_NAME = process.env.WSP_SESSION_NAME || "saludables-wsp"
const limitArg = process.argv.find((arg) => arg.startsWith("--limit="))
const LIMIT = limitArg ? Number(limitArg.split("=")[1]) : null

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const toE164 = (rawPhone) => {
  const digits = String(rawPhone).replace(/\D/g, "")
  if (!digits) return null

  if (digits.startsWith("51")) return `+${digits}`
  if (digits.length === 9) return `+51${digits}`
  return `+${digits}`
}

const toChatId = (rawPhone) => {
  const e164 = toE164(rawPhone)
  if (!e164) return null
  return `${e164.replace("+", "")}@c.us`
}

const createClient = () => {
  const client = new Client({
    authStrategy: new LocalAuth({ clientId: SESSION_NAME }),
    puppeteer: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  })

  client.on("qr", (qr) => {
    console.log("Scan this QR from WhatsApp > Linked devices")
    qrcode.generate(qr, { small: true })
  })

  client.on("authenticated", () => {
    console.log("WhatsApp authenticated")
  })

  client.on("auth_failure", (msg) => {
    console.error("Auth failure:", msg)
  })

  client.on("disconnected", (reason) => {
    console.warn("WhatsApp disconnected:", reason)
  })

  return client
}

const run = async () => {
  console.log("Mode: SEND")
  console.log(`Contacts: ${data.length}`)

  if (LIMIT !== null && (!Number.isFinite(LIMIT) || LIMIT <= 0)) {
    throw new Error("Invalid --limit value. Example: --limit=1")
  }

  const client = createClient()

  await new Promise((resolve, reject) => {
    client.once("ready", () => {
      console.log("WhatsApp client is ready")
      resolve()
    })
    client.once("auth_failure", (err) => reject(new Error(err)))
    client.initialize().catch(reject)
  })

  let ok = 0
  let failed = 0

  const contacts = LIMIT ? data.slice(0, LIMIT) : data
  if (LIMIT) {
    console.log(`Processing first ${contacts.length} contact(s) only`) 
  }

  for (const item of contacts) {
    const chatId = toChatId(item.phone)
    if (!chatId) {
      failed += 1
      console.error(`[FAIL] ${item.name}: invalid phone (${item.phone})`)
      continue
    }

    const text = message(item)

    try {
      const media = MessageMedia.fromFilePath(imagePath)
      await client.sendMessage(chatId, media, { caption: text })
      ok += 1
      console.log(`[OK] ${item.name} -> ${chatId}`)
    } catch (error) {
      failed += 1
      console.error(`[FAIL] ${item.name} -> ${chatId}: ${error.message}`)
    }

    await sleep(DELAY_MS)
  }

  console.log(`Done. Sent: ${ok}, Failed: ${failed}`)
  await client.destroy()
}

run().catch((error) => {
  console.error("Fatal error:", error.message)
  process.exit(1)
})

