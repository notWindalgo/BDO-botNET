//Require
const fs = require('fs');
const lang = require("./language.json");

const setup = require("./setup.js");
const reminder = require("./reminder.js");
const payout = require("./payout.js");
const audit = require("./audit.js");
const guildLog = require("./guildLog.js");


function start(message, filterAuthor, guilds, bot, Discord){
  //If guild is already set up
  if(guilds[message.guild.id] && guilds[message.guild.id].guildName){
    //If command was given by GM or server owner
    if(message.author.id === message.guild.ownerID || message.member.roles.has(guilds[message.guild.id].roleMaster)){
      message.channel.send(lang.optionsMain[0])
        .then(message => main(message, filterAuthor, guilds, bot, Discord));
    }
    //no permission
    else{
      message.channel.send(lang.permission[0]);
    }
  }
  //not set up
  else{
    message.channel.send(lang.optionsError[0]);
  }
}

//MAIN MENU
function main(message, filterAuthor, guilds, bot, Discord){
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      //if [1 through 4]
      if(collected.first().content == "1"){
        //Guild Logs
        message.channel.send(lang.optionsGuildLog[0])
          .then(message => optionGuildLog(message, filterAuthor, Discord));
      }
      else if(collected.first().content == "2"){
        //Audit
        message.channel.send(lang.optionsAudit[0])
          .then(message => optionAudit(message, filterAuthor, Discord));
      }
      else if(collected.first().content == "3"){
        //Payout
        payout.check(message, guilds, function(result){
          //send message
          embed = new Discord.RichEmbed()
           .setAuthor("Weekly Payout", "https://i.imgur.com/UmhMghb.png")
           .setTitle("Node Income:  " + result.nodeIncome.toLocaleString() + "\nSea Income:   " + result.seaIncome.toLocaleString() + "\nTotal Income: " + result.weeklyIncome.toLocaleString())
           .setFooter("Node: " + result.nodeTiers + " | Sea: " + result.seaTiers + " | Wars: " + result.nodeWarCount + " | High: " + result.topHaul.toLocaleString())
           .addField("Family Name", result.attendanceNames, true)
           .addField("Pay Tier", result.attendancePay, true)
           .setColor(0x00247d)
          message.channel.send({embed});
        });
      }
      else if(collected.first().content == "4"){
        //Reminder
        reminder.build(collected.first(), guilds, bot, Discord);
      }
      else if(collected.first().content == "5"){
        //Setup
        message.channel.send(lang.optionsSetup[0])
          .then(message => optionSetup(message, filterAuthor, guilds, bot));
      }
      // if [0 or other]
      else{
        error(message, 1);
      }
      message.delete();
      collected.first().delete();
    })
    //if the wait times out (or otherwise errors)
    .catch(x => error(message, 2));
}
//GUILD LOG
function optionGuildLog(message, filterAuthor, guilds, Discord){
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      //if [1 or 2]
      if(collected.first().content == "1"){
        //Node War
        guildLog.nodeWar(message, filterAuthor, guilds, Discord);
      }
      else if(collected.first().content == "2"){
        //Sea Monster
        guildLog.seaMonster(message, filterAuthor, guilds);
      }
      // if [0 or other]
      else{
        error(message, 1);
      }
      message.delete();
      collected.first().delete();
    })
    //if the wait times out (or otherwise errors)
    .catch(x => error(message, 2));
}

//AUDIT
function optionAudit(message, filterAuthor, Discord){
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      audit.playerCheck(collected.first(), collected.first().content, filterAuthor, Discord);
      message.delete();
    })
    //if the wait times out (or otherwise errors)
    .catch(x => error(message, 2));
}

//SETUP
function optionSetup(message, filterAuthor, guilds, bot){
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      message.delete();
      collected.first().delete();
      //if [1 through 5]
      if(collected.first().content == "1"){
        //Guild Name
        message.channel.send(lang.guildName[0])
          .then(message => setup.guildName(message, filterAuthor, guilds, bot));
      }
      else if(collected.first().content == "2"){
        //Roles
        message.channel.send(lang.optionsRoles[0])
          .then(message => optionRoles(message, filterAuthor, guilds));
      }
      else if(collected.first().content == "3"){
        //Channels
        message.channel.send(lang.optionsChannels[0])
          .then(message => optionChannels(message, filterAuthor, guilds));
      }
      else if(collected.first().content == "4"){
        //Attendance
        message.channel.send(lang.attendanceType[0])
          .then(message => setup.attendanceType(message, filterAuthor, guilds));
      }
      else if(collected.first().content == "5"){
        //Payouts
        message.channel.send(lang.payoutWeight[0])
          .then(message => setup.payoutWeight(message, filterAuthor, guilds));
      }

      //if [0 or other]
      else{
        error(message, 1);
      }
    })
    //if the wait times out (or otherwise errors)
    .catch(x => error(message, 2));
}

//SETUP ROLES
function optionRoles(message, filterAuthor, guilds){
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      message.delete();
      collected.first().delete();
      //if [1 through 4]
      if(collected.first().content == "1"){
        //Guild Master
        message.channel.send(lang.roleMaster[0])
          .then(message => setup.roleMaster(message, filterAuthor, guilds));
      }
      else if(collected.first().content == "2"){
        //Officer
        message.channel.send(lang.roleOfficer[0])
          .then(message => setup.roleOfficer(message, filterAuthor, guilds));
      }
      else if(collected.first().content == "3"){
        //Member
        message.channel.send(lang.roleMember[0])
          .then(message => setup.roleMember(message, filterAuthor, guilds));
      }
      else if(collected.first().content == "4"){
        //Verified
        message.channel.send(lang.roleVerified[0])
          .then(message => setup.roleVerified(message, filterAuthor, guilds));
      }

      //if [0 or other]
      else{
        error(message, 1);
      }
    })
    //if the wait times out (or otherwise errors)
    .catch(x => error(message, 2));
}

//SETUP CHANNELS
function optionChannels(message, filterAuthor, guilds){
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      message.delete();
      collected.first().delete();
      //if [1 through 2]
      if(collected.first().content == "1"){
        //Guild Master
        message.channel.send(lang.channelAnnouncements[0])
          .then(message => setup.channelAnnouncements(message, filterAuthor, guilds));
      }
      else if(collected.first().content == "2"){
        //Officer
        message.channel.send(lang.channelCommands[0])
          .then(message => setup.channelCommands(message, filterAuthor, guilds));
      }

      //if [0 or other]
      else{
        error(message, 1);
      }
    })
    //if the wait times out (or otherwise errors)
    .catch(x => error(message, 2));
}


function error(message, x){
  //delete previous prompt and send error message
  message.channel.send(lang.optionsError[x]);
  if(x == 2 && !message.deleted){
    message.delete()
  }
}

module.exports = {
  start: start,
};
