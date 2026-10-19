/*
  plugins/bot/menu.js
  Menu command for ZENITH-XMD WhatsApp bot

  - Loads assets/menu.jpg and assets/bot.jpg (creates assets/ if missing)
  - Groups plugins from global.plugins by plugin.category using a Map
  - Builds a neat menu text and counts total plugins
  - Sends menu as image caption (falls back to text-only if menu image missing)
  - Attempts to update profile picture using assets/bot.jpg inside try/catch

  Notes:
  - This file assumes a runtime where `global.plugins` is a Map of plugin objects.
    Each plugin may expose `help` (array of strings) or `commands` or `name` and a
    `category` string. The code is defensive and will try several fields.
  - The handler function signature is intentionally generic: async (sock, m, args)
    so it should be compatible with common loader patterns. Adjust the export if
    your loader expects a different interface.
*/

const fs = require('fs')
const path = require('path')

// Helper: format uptime seconds -> HH:MM:SS
function formatUptime(seconds) {
  seconds = Number(seconds || 0)
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0')
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')
  const s = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}

// Build menu text from grouped Map
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
    lines.push(`╭─── ${String(category || 'UNSORTED').toUpperCase()} ───`)
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

module.exports = {
  name: 'menu',
  category: 'bot',
  description: 'Show bot menu with grouped commands and update profile picture (if available).',

  // Generic handler. Your loader may pass different parameters — adapt as needed.
  // Typical loader signature: (sock, m, args, extra) but this will work with (sock, m, args)
  handler: async (sock, m, args) => {
    // Derive chat id / sender depending on how your loader passes message `m`
    // Try common properties, fallback to m.chat or m.from
    const chatId = (m && (m.chat || m.from)) || m || 'status'

    // Ensure assets folder exists (sync check as requested)
    const assetsDir = path.join(process.cwd(), 'assets')
    if (!fs.existsSync(assetsDir)) {
      // create recursively if missing
      fs.mkdirSync(assetsDir, { recursive: true })
    }

    const menuImgPath = path.join(assetsDir, 'menu.jpg')
    const botImgPath = path.join(assetsDir, 'bot.jpg')
    const hasMenuImage = fs.existsSync(menuImgPath)
    const hasBotImage = fs.existsSync(botImgPath)

    // Try to update profile picture (do not crash on failure)
    if (hasBotImage) {
      try {
        // read image buffer and update profile picture
        const botImg = fs.readFileSync(botImgPath)
        // some sock implementations expect jid or sock.user.id
        const pid = (sock && sock.user && sock.user.id) ? sock.user.id : (sock && sock.user && sock.user.jid) ? sock.user.jid : null
        if (typeof sock.updateProfilePicture === 'function' && pid) {
          await sock.updateProfilePicture(pid, botImg)
        }
      } catch (err) {
        // Don't let profile update errors crash the handler
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

    // If pluginsMap not found, return a simple text menu
    if (!pluginsMap) {
      const fallbackText = `Bot: ${botName}\nOwner: ${ownerName}\nPlugins: 0\nUptime: ${uptime}\nMode: ${mode}\n\nNo plugins available.\n© 2026 ZENITH-XMD`
      // Send text-only fallback
      try {
        await sock.sendMessage(chatId, { text: fallbackText })
      } catch (err) {
        console.error('Failed to send fallback menu:', err)
      }
      return
    }

    // Group plugins by category using a Map for O(plugins) time
    const grouped = new Map()
    let totalCommands = 0

    // Iterate over global.plugins Map (no blocking sync loops)
    for (const [pluginId, plugin] of pluginsMap) {
      // Determine category
      const category = (plugin && plugin.category) ? plugin.category : 'misc'

      // Extract commands/help entries from plugin defensively
      let commands = []
      if (plugin) {
        if (Array.isArray(plugin.help) && plugin.help.length) {
          // help array might include full usage strings; normalize
          commands = plugin.help.map(h => String(h).trim())
        } else if (Array.isArray(plugin.commands) && plugin.commands.length) {
          commands = plugin.commands.map(c => String(c).trim())
        } else if (plugin.name && plugin.name.trim()) {
          commands = [String(plugin.name).trim()]
        } else if (plugin.command && typeof plugin.command === 'string') {
          commands = [plugin.command.trim()]
        }
      }

      if (!commands.length) continue // skip plugins with no visible commands

      totalCommands += commands.length

      // Ensure category bucket
      if (!grouped.has(category)) grouped.set(category, [])
      const bucket = grouped.get(category)

      // Add each command to the bucket (dedupe lightly)
      for (const cmd of commands) {
        const normalized = cmd.replace(/^\/+/, '') // strip leading slashes if present
        if (!bucket.includes(normalized)) bucket.push(normalized)
      }
    }

    // Sort categories alphabetically for nicer output
    const sortedGrouped = new Map([...grouped.entries()].sort((a, b) => String(a[0]).localeCompare(String(b[0]))))

    // Build menu text
    const menuText = buildMenuText({
      botName,
      ownerName,
      totalPlugins: totalCommands,
      mode,
      uptime,
      prefix,
      grouped: sortedGrouped
    })

    // Send as image caption if image exists, otherwise send text-only
    try {
      if (hasMenuImage) {
        const imageBuffer = fs.readFileSync(menuImgPath)
        await sock.sendMessage(chatId, { image: imageBuffer, caption: menuText })
      } else {
        await sock.sendMessage(chatId, { text: menuText })
      }
    } catch (err) {
      // On send failure, try text as final fallback
      console.error('Failed to send menu (image or caption). Falling back to text. Error:', err && err.message ? err.message : err)
      try {
        await sock.sendMessage(chatId, { text: menuText })
      } catch (e) {
        console.error('Failed to send text menu fallback:', e && e.message ? e.message : e)
      }
    }
  }
}
