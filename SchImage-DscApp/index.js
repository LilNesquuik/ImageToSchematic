const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const { Output, Token } = require("./config.json");
const { Client, GatewayIntentBits, SlashCommandBuilder, Attachment, AttachmentBuilder, EmbedBuilder, ActivityType } = require('discord.js');

let created = 0;

const client = new Client({
  intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildIntegrations,
      GatewayIntentBits.GuildPresences
  ]
})


const data = new SlashCommandBuilder()
  .setName('schematic')
  .setDescription('Schematic builder')
	.addNumberOption(option =>
		option.setName("px")
			.setDescription('resolution (max 128)')
			.setRequired(true)
).addStringOption(option =>
    option.setName("url")
      .setDescription('set the url')
      .setRequired(true)
);;



client.on('ready', (c) => {
  client.application.commands.create(data)
  console.log(`Logged in as ${c.user.tag}!`);  

  setInterval(() => {
    const activities = [
      '🔨 Crafting blueprints',
      '📖 Building schematics',
      '📋 blueprints : '+created,
      '📖 Servers : '+ client.guilds.cache.size
    ];
    const activity = activities[Math.floor(Math.random() * activities.length)];
    
    client.user.setPresence({activities: [{name: activity, type: ActivityType.Playing}]})
  }, 15000); 
});


client.on('interactionCreate', async interaction => {
  if (interaction.isCommand())
  {
    if (interaction.commandName === "schematic")
    {
      console.log(`┏${interaction.user.username} use SlashCommand `)
      const imageLink = interaction.options.getString("url");
      const pixels = interaction.options.getNumber('px');
      
      const embedstart = new EmbedBuilder()
      .setAuthor({iconURL: "https://cdn.discordapp.com/attachments/1082826160871833640/1091370808108126248/blueprint_design_drawing_illustration_sketch_plan_architecture_paper_print-512.webp", name: "Image To Schematic"})
      .setDescription("*The preparation of the schematic has just been initiated. Please be patient while the process completes.* <a:loading:1091374629295247450>")
      .setFooter({text: "Request by "+interaction.user.username, iconURL: interaction.user.displayAvatarURL()})
      .setColor("#63A8F7")

      const editembed = await interaction.reply({embeds: [embedstart]})
      const fileName = imageLink.substring(imageLink.lastIndexOf('/') + 1);
  
      const image = await loadImage(imageLink);
      const imagePath = `./${fileName}`;
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(imagePath, buffer);
      
      if (!fs.existsSync(Output)) {
        fs.mkdirSync(Output);
      }

      Schematic(imagePath, pixels)

      await setTimeout(() => {
        const jsonPath = `${Output}/${fileName.replace(/\.[^/.]+$/, '')}.json`;
        if (fs.existsSync(jsonPath)) {        
          const embedfinish = new EmbedBuilder()
          .setAuthor({iconURL: "https://cdn.discordapp.com/attachments/1082826160871833640/1091370808108126248/blueprint_design_drawing_illustration_sketch_plan_architecture_paper_print-512.webp", name: "Image To Schematic"})
          .setDescription("*Preparation of schematic is completed. You can now install the file below.* <:finish:1091376182148202536>")
          .setFooter({text: "Request by "+interaction.user.username, iconURL: interaction.user.displayAvatarURL()})
          .setColor("#79F763")

          editembed.edit({embeds: [embedfinish], files: [`${jsonPath}`]});
          created++;
          console.log(`┗${interaction.user.username} : ${jsonPath} `)

          setTimeout(() => {
            fs.unlinkSync(imagePath);
            fs.unlinkSync(jsonPath);
          }, 1000)
        } else {
          interaction.reply("bug");
        }
      }, 3);
    }
  }
});
















const BLS = 1;






function Schematic(theimage, px) {    
  const init = Date.now();
  loadImage(theimage).then((image) => {
    const width = image.width;
    const height = image.height;
    
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
  
    const resizedCanvas = createCanvas(px, px);
    const resizedCtx = resizedCanvas.getContext('2d');
    resizedCtx.drawImage(canvas, 0, 0, width, height, 0, 0, px, px);
  
    const blocks = [];
  
    for (let y = 0; y < px; y += BLS) {
      for (let x = 0; x < px; x += BLS) {
        let rTotal = 0,
          gTotal = 0,
          bTotal = 0,
          aTotal = 0;
        let pixelCount = 0;
  
        for (let blockY = y; blockY < y + BLS; blockY++) {
          for (let blockX = x; blockX < x + BLS; blockX++) {
            const pixelData = resizedCtx.getImageData(blockX, blockY, 1, 1).data;
            const r = pixelData[0];
            const g = pixelData[1];
            const b = pixelData[2];
            const a = pixelData[3];
  
            if (a === 0) {
              continue;
            }
  
            rTotal += r;
            gTotal += g;
            bTotal += b;
            aTotal += a;
  
            pixelCount++;
          }
        }
  
        if (pixelCount === 0) {
          continue;
        }
  
        const rAvg = Math.round(rTotal / pixelCount);
        const gAvg = Math.round(gTotal / pixelCount);
        const bAvg = Math.round(bTotal / pixelCount);
  
        const blockName = `Block (${x},${y})`;
        const objectId = -10368 - (y * px + x);
        const parentId = -10344;
  
        const hexColor = rgbhex(rAvg, gAvg, bAvg);
  
        blocks.push({
          Name: blockName,
          ObjectId: objectId,
          ParentId: parentId,
          Position: { x: x / BLS, y: 0, z: y / BLS },
          Rotation: { x: -90, y: 0, z: 0 },
          Scale: { x: 1, y: 1, z: 1 },
          BlockType: 1,
          Properties: {
            PrimitiveType: 5,
            Color: hexColor
          },
        });
      }
    }
  
    const output = {
      RootObjectId: -10344,
      Blocks: blocks,
    };
  
    const json = JSON.stringify(output, null, 2);
  
    const FileName = `${Output}/${theimage.replace(/\.[^/.]+$/, '')}.json`;
    
    fs.writeFileSync(FileName, json, 'utf8');
    const end = Date.now();
    console.log(`┃${end - init}ms`)
  }).catch((err) => {
    console.error(err);
  });
}


function rgbhex(r, g, b) {
  const R = r.toString(16).padStart(2, '0');
  const G = g.toString(16).padStart(2, '0');
  const B = b.toString(16).padStart(2, '0');
  return `#${R}${G}${B}`;
}

client.login(Token);