const { Client, MessageEmbed } = require("discord.js");
const request = require("request");
const client = new Client();
const config = require("./config");
const db = require("quick.db");

client.on("ready", async () => {          
  console.log("[#] Bot successfully connected as " + client.user.tag + ".");
  client.user.setPresence({
    activity: { type: "WATCHING", name: "the statuses | !services" },
  });
  const channel = client.channels.cache.get(config.statusCh);
  setInterval(() => {
    config.checkSites.forEach((cfg) => {
      request(cfg.link, async function (error, response, body) {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          if (db.has(`down.${cfg.id}`)) {
            db.delete(`down.${cfg.id}`);
            const activeAll = new MessageEmbed()
              .setDescription(
                `<:vcodesOperational:891428689844260906> **[${cfg.name}](${cfg.link}) are online.**`
              )
              .setColor("GREEN")
              .setFooter("status.vcodes.xyz | by clqu");
            channel.send(activeAll);
          }
        } else {
          if (!db.has(`down.${cfg.id}`)) {
            db.set(`down.${cfg.id}`, true);
            const someDown = new MessageEmbed()
              .setDescription(
                `<:vcodesDowntime:891428689705861131> **[${cfg.name}](${cfg.link}) are down.**`
              )
              .setColor("RED")
              .setFooter("status.vcodes.xyz | by clqu");
            channel.send(someDown);
          }
        }
      });
    });
  }, 5000);
});

client.on("message", (message) => {
  if (message.content === "!services") {
    const activeAll = new MessageEmbed()
      .setDescription(
        "<:vcodesOperational:891428689844260906> **All services are online.**"
      )
      .setColor("GREEN")
      .setFooter("status.vcodes.xyz | by clqu");
    const someDown = new MessageEmbed()
      .setDescription(
        "<:vcodesDowntime:891428689705861131> **Some services are down.**"
      )
      .setColor("RED")
      .setFooter("status.vcodes.xyz | by clqu");
    let downedServices = [];
    config.checkSites.forEach((cfg) => {
      if (db.has(`down.${cfg.id}`)) {
        downedServices.push(cfg);
      }
    });
    if (downedServices.length > 0) {
      downedServices.map((serv) => {
        someDown.addField(serv.name, serv.link);
      });
    }
    message.channel.send(downedServices.length > 0 ? someDown : activeAll);
  }
  if (message.content === "!ping") {
    message.reply("Pong... " + client.ws.ping + "ms");
  }
});
client.login(config.token);
