module.exports = {
  // When settings updated
  updated: () => `> *I would*\n> *Updated ✅*`,

  successful: () => `*✅ Successful*`,

  success: () => `*✅ Success*`,

  admin: () => `*⛔ Only group admin are authorised to use this commands*`,

  owner: () => `*👑 You are not my owner*\n> Only Simon can use this command`,

  // Extra I added for you - ZENITH style
  wait: () => `*🏔️ ZENITH-XMD processing...*`,
  
  done: () => `*🏔️ Done by ZENITH-XMD PEAK*`,
  
  group: () => `*📛 This is group command only*`,
  
  botAdmin: () => `*🤖 Make me admin first*`,

  error: () => `*❌ Failed, try again*`
}
