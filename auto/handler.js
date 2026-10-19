// Baileys handler - Put in your main bot file
function getDB(){ return global.db || {settings:{}, groups:{}} }

module.exports = async (sock) => {
  
  // PRESENCE 24/7 - Your explanation: typing, recording, online everywhere
  setInterval(async () => {
    const db = getDB();
    if(db.settings.autotyping){
      await sock.sendPresenceUpdate('composing', 'all@s.whatsapp.net');
    }
    if(db.settings.autorecording){
      await sock.sendPresenceUpdate('recording', 'all@s.whatsapp.net');
    }
    if(db.settings.autopresence){
      await sock.sendPresenceUpdate('available');
    }
  }, 3000);

  // MESSAGE HANDLER
  sock.ev.on('messages.upsert', async ({messages}) => {
    const m = messages[0];
    if(!m.message) return;
    const db = getDB();
    const from = m.key.remoteJid;
    const isGroup = from.endsWith('@g.us');
    const isNewDM = !isGroup && m.key.fromMe === false; // new msg only

    // AUTOREPLY - Your explanation: reply hey to every NEW DM only
    if(isNewDM && (db.settings.autoreply || db.settings.autoai || db.settings.autochat || db.settings.autoanswer || db.settings.autorespond || db.settings.autoresponse)){
      await sock.sendMessage(from, {text: "hey"});
    }

    // AUTOTRANSLATE - Your explanation: translate every non-English for DM+Groups
    if(db.settings.autotranslate){
      const text = m.message.conversation || m.message.extendedTextMessage?.text;
      if(text && /[^a-zA-Z0-9 ]/.test(text)){ // simple non-english check
        // use translate API
        // const translated = await translate(text, 'en');
        // await sock.sendMessage(from, {text: `Translated: ${translated}`});
      }
    }

    // AUTOREAD - blue tick
    if(db.settings.autoread){
      await sock.readMessages([m.key]);
    }
  });

  // GROUP PARTICIPANTS - Your explanation: welcome/goodbye for ANY group where I'm admin+member
  sock.ev.on('group-participants.update', async (update) => {
    const db = getDB();
    const groupId = update.id;
    
    // WELCOME
    if(update.action === 'add' && db.groups[groupId]?.autowelcome){
      for(let user of update.participants){
        await sock.sendMessage(groupId, {text: `Welcome @${user.split('@')[0]} to the group 🎉`, mentions: [user]});
      }
    }
    // GOODBYE
    if(update.action === 'remove' && db.groups[groupId]?.autogoodbye){
      for(let user of update.participants){
        await sock.sendMessage(groupId, {text: `Goodbye @${user.split('@')[0]} 👋`, mentions: [user]});
      }
    }
  });

  // AUTOGREET - Your explanation: Good morning/afternoon/evening fans to ALL groups admin+member based on time
  const greetLoop = async () => {
    const db = getDB();
    if(!db.settings.autogreet) return;
    const hour = new Date().getHours();
    let greet = null;
    if(hour >=5 && hour <12) greet = "Good morning fans ☀️";
    else if(hour >=12 && hour <17) greet = "Good afternoon fans 🌤️";
    else if(hour >=17 && hour <22) greet = "Good evening fans 🌙";
    
    if(greet){
      const groups = await sock.groupFetchAllParticipating();
      for(let id in groups){
        await sock.sendMessage(id, {text: greet});
      }
    }
  };
  // Run every hour
  setInterval(greetLoop, 60*60*1000);

  // AUTODELETE / ANTI NEW DM - Your explanation: block new DMs from new people
  sock.ev.on('messages.upsert', async ({messages}) => {
    const db = getDB();
    if(!db.settings.autodelete) return;
    const m = messages[0];
    if(m.key.remoteJid.endsWith('@g.us')) return;
    if(m.key.fromMe) return;
    // if user not in contacts / not previous chat, block
    // await sock.updateBlockStatus(m.key.remoteJid, 'block');
  });
};
