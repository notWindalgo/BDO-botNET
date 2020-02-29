//REQUIRE
//--dependencies
const Discord = require('discord.js');
const schedule = require('node-schedule');
const express = require('express');
const fs = require('fs');

const cred = require("./cred.json");
const lang = require("./include/language.json");

//--functions
const setup = require("./include/setup.js");
const options = require("./include/options.js");
const sql = require("./include/sql.js");
const userInput = require("./include/userInput.js");
const nodeWar = require("./include/nodeWar.js");
const payout = require("./include/payout.js");
const check = require("./include/check.js");
const market = require("./include/market.js");
const marketWatch = require("./include/marketWatch.js");

//BOT INFORMATION
const bot = new Discord.Client();
const token = cred.token;

//Establish guilds.json on launch
var guildsJSON = fs.readFileSync("./guilds.json");
global.guilds = JSON.parse(guildsJSON);
//--Update guilds from json every 3 seconds
setInterval(function () {
  var guildsJSON = fs.readFileSync("./guilds.json");
  global.guilds = JSON.parse(guildsJSON);
}, 3000);

//Node War reminders
//8:00
schedule.scheduleJob({hour: 20, minute: 0}, function(){
  var guildsJSON = fs.readFileSync("./guilds.json");
  var guilds = JSON.parse(guildsJSON);
  for (var id in guilds){
      //if the guild has a fight
      if(guilds[id].nwEnemies > 0){
        bot.channels.get(guilds[id].channelAnnouncements).send(lang.nodeAlerts[3].replace("{REGION}", guilds[id].nwRegion));
      }
  }
});
//8:30
schedule.scheduleJob({hour: 20, minute: 30}, function(){
  var guildsJSON = fs.readFileSync("./guilds.json");
  var guilds = JSON.parse(guildsJSON);
  for (var id in guilds){
      //if the guild has a fight
      if(guilds[id].nwEnemies > 0){
        bot.channels.get(guilds[id].channelAnnouncements).send(lang.nodeAlerts[4].replace("{REGION}", guilds[id].nwRegion));
      }
  }
});
//8:55
schedule.scheduleJob({hour: 20, minute: 55}, function(){
  var guildsJSON = fs.readFileSync("./guilds.json");
  var guilds = JSON.parse(guildsJSON);
  for (var id in guilds){
      //if the guild has a fight
      if(guilds[id].nwEnemies > 0){
        bot.channels.get(guilds[id].channelAnnouncements).send(lang.nodeAlerts[5].replace("{REGION}", guilds[id].nwRegion));
      }
  }
});
//Reset variables at 11:55
schedule.scheduleJob({hour: 23, minute: 55}, function(){
  var guildsJSON = fs.readFileSync("./guilds.json");
  var guilds = JSON.parse(guildsJSON);
  //delete messages
  for (var id in guilds){
    if(guilds[id].botMessages.length > 0){
      var i;
      for(i = 0; i < guilds[id].botMessages.length; i++){
        bot.channels.get(guilds[id].channelAnnouncements).fetchMessage(guilds[id].botMessages[i])
          .then(message => message.delete());
      }
    }
    //reset json
    guilds[id].nwRegion = "";
    guilds[id].nwTier = "0";
    guilds[id].nwEnemies = "0";
    guilds[id].nwSignUp = "";
    guilds[id].botMessages = [];
  }
  fs.writeFileSync('guilds.json', JSON.stringify(guilds, null, 2));
});

//START BOT
bot.on("error", (error) => {
  console.log(error);
});
bot.on('ready', () => {
  console.log("=================");
  console.log("Logged in as: ");
  console.log(bot.user.username + " - (" + bot.user.id + ")");
  console.log("=================");
});

//Market Watch
schedule.scheduleJob('*/2 * * * *', function(){
  marketWatch.marketWatch(Discord, bot);
});

//ON MESSAGE
bot.on('message', message => {
  //dont listen to DMs
  if(message.channel.type!= "text"){
    return;
  }
  //check for proper perms
  if(message.content.substring(0, 1) == "!" && !message.channel.permissionsFor(bot.user.id).has(["SEND_MESSAGES", "MANAGE_MESSAGES", "MANAGE_ROLES", "MANAGE_NICKNAMES"])){
    message.channel.send(lang.permission[1]);
    return;
  }
  //--split command into parts
  let messageSplit = message.content.split(" ");
  let command = messageSplit[0].toLowerCase();
  let parameters = messageSplit.splice(1, messageSplit.length).join(" ");

//Admin controls-- can be used from any channel in case of roles being deleted
  switch(command){
      case "!setup":
        message.delete();
        //Create filter for message author
        var filterAuthor = m => m.author === message.author;
        //Open guilds json, parse to a varible
        var guildsJSON = fs.readFileSync("./guilds.json");
        var guilds = JSON.parse(guildsJSON);
        setup.initialize(message, filterAuthor, guilds, bot);
      break;

      case "!options":
        message.delete();
        //Create filter for message author
        var filterAuthor = m => m.author === message.author;
        //Open guilds json, parse to a varible
        var guildsJSON = fs.readFileSync("./guilds.json");
        var guilds = JSON.parse(guildsJSON);
        options.start(message, filterAuthor, guilds, bot, Discord);
      break;

    }

    //If guild is setup and message is in commands channel
    if(global.guilds[message.guild.id] && "channelCommands" in global.guilds[message.guild.id] && message.channel.id === global.guilds[message.guild.id].channelCommands){
      if(message.member.roles.has(global.guilds[message.guild.id].roleMaster) || message.member.roles.has(global.guilds[message.guild.id].roleOfficer)){
        //Officer commands
        switch(command){
          case "!node":
            message.delete();
            //Create filter for message author
            var filterAuthor = m => m.author === message.author;
            //Open guilds json, parse to a varible
            var guildsJSON = fs.readFileSync("./guilds.json");
            var guilds = JSON.parse(guildsJSON);
            //Check for announcement permissions
            if(!bot.channels.get(guilds[message.guild.id].channelAnnouncements).permissionsFor(bot.user.id).has(["VIEW_CHANNEL", "SEND_MESSAGES", "ADD_REACTIONS", "MANAGE_MESSAGES"])){
              message.channel.send(lang.permission[2]);
              return;
            }
            nodeWar.node(message, guilds, filterAuthor, bot);
          break;
        }
      }
      //User commands
      switch(command){
        case "!verify":
          message.delete();
          userInput.verify(message, parameters, global.guilds);
        break;

        case "!stats":
          message.delete();
          userInput.stats(message, global.guilds);
        break;

        case "!loot":
          message.delete();
          //Create filter for message author
          var filterAuthor = m => m.author === message.author;
          userInput.seaLoot(message, parameters, filterAuthor);
        break;

        case "!check":
          message.delete();
          //Open guilds json, parse to a varible
          var guildsJSON = fs.readFileSync("./guilds.json");
          var guilds = JSON.parse(guildsJSON);
          if(message.isMentioned(bot.user)){
            check.guild(message, guilds, Discord);
          }
          else{
            check.player(message, parameters, guilds, Discord);
          }
        break;

        case "!search":
          message.delete();
          var filterAuthor = m => m.author === message.author;
          market.search(message, parameters, filterAuthor, Discord);
        break;

        case "!list":
          message.delete();
          //Create filter for message author
          var filterAuthor = m => m.author === message.author;
          //Load watch list json
          var watchListJSON = fs.readFileSync("./watchList.json");
          var watchList = JSON.parse(watchListJSON);
          marketWatch.list(message, filterAuthor, watchList);
        break;

        case "!help":
          message.channel.send(lang.help[0]);
          message.delete();
        break;
      }
    }
});

//LAUNCH BOT
bot.login(token);
