/*
  plugins/bot/menu.js
  Async menu command for ZENITH-XMD WhatsApp bot

  Improvements made:
  - Uses fs.existsSync to check/create assets/ (as requested)
  - Uses async file IO (fs.promises.readFile / mkdir) to avoid blocking sync reads
  - Keeps a single pass over global.plugins Map and groups using a Map
  - Adds per-category command counts in the menu output
  - Exports handler and a `run` alias for loader flexibility
  - Includes detailed comments
*/

const fs = require('fs')
const fsp = fs.promises
const path = require('path')

// Helper: format uptime seconds -> HH:MM:SS
function formatUptime(seconds) {
  seconds = Number(seconds || 0)
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0')
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')
  const s = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}

// Build menu text from grouped Map, includes per-category counts
function buildMenuText({ botName, ownerName, totalPlugins, mode, uptime, prefix, grouped }) {
  const lines = []
  // Header
  lines.push(`Bot: ${botName}`)
  lines.push(`Owner: ${ownerName}`)
  lines.push(`Plugins: ${totalPlugins}`)
  lines.push(`Uptime: ${uptime}`)
  lines.push(`Mode: ${mode}`)
  lines.push('')

  // Categories
  for (const [category, commands] of grouped) {
    lines.push(`╭─── ${String(category || 'UNSORTED').toUpperCase()} ─── (${commands.length} commands)`)
    for (const cmd of commands) {
      lines.push(`• ${prefix}${cmd}`)
    }
    lines.push('╰────────────────────────')
    lines.push('')
  }

  // Footer
  lines.push('© 2026 ZENITH-XMD')
  return lines.join('\n')
}

async function handler(sock, m, args) {
  // Determine chat id / sender
  const chatId = (m && (m.chat || m.from)) || m || 'status'

  // Ensure assets folder exists (fs.existsSync check as requested)
  const assetsDir = path.join(process.cwd(), 'assets')
  if (!fs.existsSync(assetsDir)) {
    // Use async mkdir but presence was checked with existsSync above
    try {
      await fsp.mkdir(assetsDir, { recursive: true })
    } catch (err) {
      console.error('Failed to create assets directory:', err)
      // proceed — subsequent reads will likely fail and fall back to text-only
    }
  }

  const menuImgPath = path.join(assetsDir, 'menu.jpg')
  const botImgPath = path.join(assetsDir, 'bot.jpg')
  const hasMenuImage = fs.existsSync(menuImgPath)
  const hasBotImage = fs.existsSync(botImgPath)

  // Attempt to update profile picture (do not crash on failure)
  if (hasBotImage) {
    try {
      const botImg = await fsp.readFile(botImgPath)
      const pid = (sock && sock.user && (sock.user.id || sock.user.jid)) ? (sock.user.id || sock.user.jid) : null
      if (typeof sock.updateProfilePicture === 'function' && pid) {
        await sock.updateProfilePicture(pid, botImg)
      }
    } catch (err) {
      console.error('Failed to update profile picture:', err && err.message ? err.message : err)
    }
  }

  // Gather plugins from global.plugins (expected to be a Map)
  const pluginsMap = (global && global.plugins && global.plugins instanceof Map) ? global.plugins : null

  // Prepare defaults
  const botName = (global && global.botName) || (sock && sock.user && (sock.user.name || sock.user.vname)) || 'ZENITH-XMD'
  const ownerName = (global && global.ownerName) || 'Owner'
  const prefix = (global && global.prefix) || '.'
  const mode = (global && global.mode) || 'public'
  const uptime = formatUptime(process.uptime && process.uptime())

  if (!pluginsMap) {
    const fallbackText = `Bot: ${botName}\nOwner: ${ownerName}\nPlugins: 0\nUptime: ${uptime}\nMode: ${mode}\n\nNo plugins available.\n© 2026 ZENITH-XMD`
    try {
      await sock.sendMessage(chatId, { text: fallbackText })
    } catch (err) {
      console.error('Failed to send fallback menu:', err)
    }
    return
  }

  // Group plugins by category using a Map for O(n) time
  const grouped = new Map()
  let totalCommands = 0

  for (const [pluginId, plugin] of pluginsMap) {
    const category = (plugin && plugin.category) ? plugin.category : 'misc'

    // Extract commands/help entries from plugin defensively
    let commands = []
    if (plugin) {
      if (Array.isArray(plugin.help) && plugin.help.length) {
        commands = plugin.help.map(h => String(h).trim())
      } else if (Array.isArray(plugin.commands) && plugin.commands.length) {
        commands = plugin.commands.map(c => String(c).trim())
      } else if (plugin.name && plugin.name.trim()) {
        commands = [String(plugin.name).trim()]
      } else if (plugin.command && typeof plugin.command === 'string') {
        commands = [plugin.command.trim()]
      }
    }

    if (!commands.length) continue

    totalCommands += commands.length

    if (!grouped.has(category)) grouped.set(category, [])
    const bucket = grouped.get(category)

    for (const cmd of commands) {
      const normalized = cmd.replace(/^\/+/, '')
      if (!bucket.includes(normalized)) bucket.push(normalized)
    }
  }

  // Sort categories alphabetically for consistent output
  const sortedGrouped = new Map([...grouped.entries()].sort((a, b) => String(a[0]).localeCompare(String(b[0]))))

  // Build menu text (per-category counts included)
  const menuText = buildMenuText({
    botName,
    ownerName,
    totalPlugins: totalCommands,
    mode,
    uptime,
    prefix,
    grouped: sortedGrouped
  })

  // Send as image caption if image exists, otherwise send text-only. Use async reads.
  try {
    if (hasMenuImage) {
      const imageBuffer = await fsp.readFile(menuImgPath)
      await sock.sendMessage(chatId, { image: imageBuffer, caption: menuText })
    } else {
      await sock.sendMessage(chatId, { text: menuText })
    }
  } catch (err) {
    console.error('Failed to send menu (image or caption). Falling back to text. Error:', err && err.message ? err.message : err)
    try {
      await sock.sendMessage(chatId, { text: menuText })
    } catch (e) {
      console.error('Failed to send text menu fallback:', e && e.message ? e.message : e)
    }
  }
}

module.exports = {
  name: 'menu',
  category: 'bot',
  description: 'Show bot menu with grouped commands and update profile picture (if available).',
  handler
}

// export alias for loader flexibility
module.exports.run = handler
