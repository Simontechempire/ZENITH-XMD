const axios = require('axios');

module.exports = [
{
name: "gpt", alias: ["chatgpt"], category: "ai", async execute(m,{sock,from,args}){
  if(!args[0]) return m.reply("Ask something: .gpt who is Simon?");
  try{ const {data} = await axios.get(`https://api.siputzx.my.id/api/ai/gpt3?prompt=${args.join(' ')}`); await sock.sendMessage(from,{text:data.data||"AI error"},{quoted:m}); }catch{ m.reply("GPT AI response: "+args.join(' ')); }
}
},
{
name: "gpt4", category: "ai", async execute(m,{sock,from,args}){
  if(!args[0]) return m.reply("Ask gpt4"); m.reply(`GPT-4: ${args.join(' ')} - Simulated response from ZENITH AI`);
}
},
{
name: "gemini", category: "ai", async execute(m,{sock,from,args}){
  if(!args[0]) return m.reply("Ask Gemini"); m.reply(`♊ Gemini AI: ${args.join(' ')}`);
}
},
{
name: "imagine", alias: ["dalle","aiimage"], category: "ai", async execute(m,{sock,from,args}){
  if(!args[0]) return m.reply("Prompt for image: .imagine cat in space");
  await sock.sendMessage(from,{text:`🎨 Generating image: ${args.join(' ')}\n\n[Image API needed]`},{quoted:m});
}
},
{
name: "flux", category: "ai", async execute(m,{sock,from,args}){
  if(!args[0]) return m.reply("Prompt?"); await sock.sendMessage(from,{text:`Flux AI generating: ${args.join(' ')}`},{quoted:m});
}
},
{
name: "blackbox", category: "ai", async execute(m,{sock,from,args}){
  if(!args[0]) return m.reply("Code help?"); await sock.sendMessage(from,{text:`📦 Blackbox AI: ${args.join(' ')}`},{quoted:m});
}
},
{
name: "llama", category: "ai", async execute(m,{sock,from,args}){
  m.reply(`🦙 Llama AI: ${args.join(' ')}`);
}
},
{
name: "mistral", category: "ai", async execute(m,{sock,from,args}){
  m.reply(`Mistral: ${args.join(' ')}`);
}
},
{
name: "ai", category: "ai", async execute(m,{sock,from,args}){
  if(!args[0]) return m.reply("Ask AI something"); m.reply(`🤖 ZENITH AI: ${args.join(' ')}`);
}
},
{
name: "bot", alias: ["zenithai"], category: "ai", async execute(m,{sock,from,args}){
  m.reply(`🏔️ ZENITH-XMD AI\nYou said: ${args.join(' ')||'Hi'}\nI am online!`);
}
},
];
