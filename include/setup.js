//Require
const fs = require('fs');
const lang = require("./language.json");
const cred = require("../cred.json");

const sql = require("./sql.js");

//INITIALIZE
function initialize(message, filterAuthor, guilds, bot){
  //If Guild already exists
  if(guilds[message.guild.id]){
    message.channel.send(lang.error[2]);
  }
  else{
    //if server owner
    if(message.author.id === message.guild.ownerID){
      //Add new entry for current guild
      guilds[message.guild.id] = {};
      fs.writeFileSync('guilds.json', JSON.stringify(guilds, null, 2));

      //Hi-tech message animation
      message.channel.send(lang.initialize[0])
        .then(sleeper(500)).then(message => message.edit(lang.initialize[1])
          .then(sleeper(500)).then(message => message.edit(lang.initialize[2])
            .then(sleeper(500)).then(message => message.edit(lang.initialize[3])
              .then(sleeper(500)).then(message => message.edit(lang.initialize[4])
              //Welcome
                .then(sleeper(250)).then(message => message.edit(lang.welcome)
      )))))
      //Wait for the next message from the person who started setup
      message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
        .then(collected => {
          collected.first().delete();
          //if [y]
          if(collected.first().content.toLowerCase().startsWith("y")){
            //Pass to GUILD NAME function
            message.channel.send(lang.guildName[0])
              .then(message => guildName(message, filterAuthor, guilds, bot))
          }
          //if [n] or anything else
          else{
            error(message, 0);
          }
        })
        //if the wait times out (or otherwise errors)
        .catch(x => error(message, 1));
    }
    else{
      message.channel.send(lang.permission[0]);
    }
  }
}

//GUILD NAME
function guildName(message, filterAuthor, guilds, bot){
  //Wait for the next message from the person who started setup
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      //delete the prompt and the response
      message.delete();
      collected.first().delete();
      //If Guild Name is under 15 characters and contains no special characters
      if(collected.first().content.length <= 15 && /^\w+$/.test(collected.first().content)){
        guilds[message.guild.id].guildName = collected.first().content;
        //Update bot name
        message.guild.members.get(bot.user.id).setNickname(collected.first().content)
          .then(function(x) {
            //Check if GUILD MASTER role has been setup
            if(guilds[message.guild.id].roleMaster){
              success(message, guilds, 0);
            }
            else{
              //Pass to GUILD MASTER function
              message.channel.send(lang.roleMaster[0])
               .then(message => roleMaster(message, filterAuthor, guilds))
            }
          });
      }
      else{
        //If Guild Name is over 15 characters lot
        if(collected.first().content.length > 15){
          message.channel.send(lang.guildName[1])
            .then(message => guildName(message, filterAuthor, guilds, bot));
        }
        //If Guild Name contains special characters
        else{
          message.channel.send(lang.guildName[2])
            .then(message => guildName(message, filterAuthor, guilds, bot));
        }
      }
    })
    //if the wait times out (or otherwise errors)
    .catch(x => error(message, 1));
}

//GUILD MASTER
function roleMaster(message, filterAuthor, guilds){
  //Wait for the next message from the person who started setup
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      //delete the prompt and the response
      message.delete();
      collected.first().delete();
      //If only 1 role is mentioned
      if(collected.first().mentions.roles.size === 1){
        guilds[message.guild.id].roleMaster = collected.first().mentions.roles.first().id;
        //Check if GUILD OFFICER has been setup
        if(guilds[message.guild.id].roleOfficer){
          success(message, guilds, 0);
        }
        //Pass to GUILD MEMBER function
        else{
          message.channel.send(lang.roleOfficer[0])
            .then(message => roleOfficer(message, filterAuthor, guilds));
        }
      }
      else{
        //If no guild roles are mentioned
        if(collected.first().mentions.roles.size === 0){
          message.channel.send(lang.roleMaster[1])
            .then(message => roleMaster(message, filterAuthor, guilds));
        }
        //If multiple guild roles are mentioned
        else{
          message.channel.send(lang.roleMaster[2])
            .then(message => roleMaster(message, filterAuthor, guilds));
        }
      }
    })
    //if the wait times out (or otherwise errors)
    .catch(x => error(message, 1));
}

//GUILD OFFICER
function roleOfficer(message, filterAuthor, guilds){
  //Wait for the next message from the person who started setup
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      //delete the prompt and the response
      message.delete();
      collected.first().delete();
      //If only 1 role is mentioned
      if(collected.first().mentions.roles.size === 1){
        guilds[message.guild.id].roleOfficer = collected.first().mentions.roles.first().id;
        //Check if GUILD MEMBER has been setup
        if(guilds[message.guild.id].roleMember){
          success(message, guilds, 0);
        }
        //Pass to GUILD MEMBER function
        else{
          message.channel.send(lang.roleMember[0])
            .then(message => roleMember(message, filterAuthor, guilds));
        }
      }
      else{
        //If no guild roles are mentioned
        if(collected.first().mentions.roles.size === 0){
          message.channel.send(lang.roleOfficer[1])
            .then(message => roleOfficer(message, filterAuthor, guilds));
        }
        //If multiple guild roles are mentioned
        else{
          message.channel.send(lang.roleOfficer[2])
            .then(message => roleOfficer(message, filterAuthor, guilds));
        }
      }
    })
    //if the wait times out (or otherwise errors)
    .catch(x => error(message, 1));
}

//GUILD MEMBER
function roleMember(message, filterAuthor, guilds){
  //Wait for the next message from the person who started setup
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      //delete the prompt and the response
      message.delete();
      collected.first().delete();
      //If only 1 role is mentioned
      if(collected.first().mentions.roles.size === 1){
        guilds[message.guild.id].roleMember = collected.first().mentions.roles.first().id;
        //Check if GUILD VERIFIED has been setup
        if(guilds[message.guild.id].roleVerified){
          success(message, guilds, 0);
        }
        //Pass to GUILD VERIFIED function
        else{
          message.channel.send(lang.roleVerified[0])
            .then(message => roleVerified(message, filterAuthor, guilds));
        }
      }
      else{
        //If no guild roles are mentioned
        if(collected.first().mentions.roles.size === 0){
          message.channel.send(lang.roleMember[1])
            .then(message => roleMember(message, filterAuthor, guilds));
        }
        //If multiple guild roles are mentioned
        else{
          message.channel.send(lang.roleMember[2])
            .then(message => roleMember(message, filterAuthor, guilds));
        }
      }
    })
    //if the wait times out (or otherwise errors)
    .catch(x => error(message, 1));
}

//GUILD VERIFIED
function roleVerified(message, filterAuthor, guilds){
  //Wait for the next message from the person who started setup
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      //delete the prompt and the response
      message.delete();
      collected.first().delete();
      //If only 1 role is mentioned
      if(collected.first().mentions.roles.size === 1){
        guilds[message.guild.id].roleVerified = collected.first().mentions.roles.first().id;
        //Check if CHANNEL ANNOUNCEMENTS has been setup
        if(guilds[message.guild.id].channelAnnouncements){
          success(message, guilds, 0);
        }
        //Pass to CHANNEL ANNOUNCEMENTS function
        else{
          message.channel.send(lang.channelAnnouncements[0])
            .then(message => channelAnnouncements(message, filterAuthor, guilds));
        }
      }
      else{
        //If no guild roles are mentioned
        if(collected.first().mentions.roles.size === 0){
          message.channel.send(lang.roleVerified[1])
            .then(message => roleVerified(message, filterAuthor, guilds));
        }
        //If multiple guild roles are mentioned
        else{
          message.channel.send(lang.roleVerified[2])
            .then(message => roleVerified(message, filterAuthor, guilds));
        }
      }
    })
    //if the wait times out (or otherwise errors)
    .catch(x => error(message, 1));
}

//GUILD ANNOUNCEMENTS
function channelAnnouncements(message, filterAuthor, guilds){
  //Wait for the next message from the person who started setup
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      //delete the prompt and the response
      message.delete();
      collected.first().delete();
      //If only 1 channel is mentioned
      if(collected.first().mentions.channels.size === 1){
        guilds[message.guild.id].channelAnnouncements = collected.first().mentions.channels.first().id;
        //Check if CHANNEL COMMANDS has been setup
        if(guilds[message.guild.id].channelCommands){
          success(message, guilds, 0);
        }
        //Pass to CHANNEL COMMANDS function
        else{
          message.channel.send(lang.channelCommands[0])
            .then(message => channelCommands(message, filterAuthor, guilds));
        }
      }
      else{
        //If no channels are mentioned
        if(collected.first().mentions.channels.size === 0){
          message.channel.send(lang.channelAnnouncements[1])
            .then(message => channelAnnouncements(message, filterAuthor, guilds));
        }
        //If multiple channels are mentioned
        else{
          message.channel.send(lang.channelAnnouncements[2])
            .then(message => channelAnnouncements(message, filterAuthor, guilds));
        }
      }
    })
    //if the wait times out (or otherwise errors)
    .catch(x => error(message, 1));
}

//GUILD COMMANDS
function channelCommands(message, filterAuthor, guilds){
  //Wait for the next message from the person who started setup
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      //delete the prompt and the response
      message.delete();
      collected.first().delete();
      //If only 1 channel is mentioned
      if(collected.first().mentions.channels.size === 1){
        guilds[message.guild.id].channelCommands = collected.first().mentions.channels.first().id;
        //Check if ATTENDANCE TYPE has been setup
        if(guilds[message.guild.id].attendanceType){
          success(message, guilds, 0);
        }
        //Pass to ATTENDANCE TYPE function
        else{
          message.channel.send(lang.attendanceType[0])
            .then(message => attendanceType(message, filterAuthor, guilds));
        }
      }
      else{
        //If no channels are mentioned
        if(collected.first().mentions.channels.size === 0){
          message.channel.send(lang.channelCommands[1])
            .then(message => channelCommands(message, filterAuthor, guilds));
        }
        //If multiple channels are mentioned
        else{
          message.channel.send(lang.channelCommands[2])
            .then(message => channelCommands(message, filterAuthor, guilds));
        }
      }
    })
    //if the wait times out (or otherwise errors)
    .catch(x => error(message, 1));
}

//ATTENDANCE TYPE
function attendanceType(message, filterAuthor, guilds){
  //Wait for the next message from the person who started setup
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      //delete the prompt and the response
      message.delete();
      collected.first().delete();
      //Voice Comms
      if(collected.first().content === "1"){
        guilds[message.guild.id].attendanceType = "comms";
        guilds[message.guild.id].voiceChannels = [];
        //Pass to VOICE CHANNELS function
        message.channel.send(lang.voiceChannels[0].replace("{AMOUNT}", guilds[message.guild.id].voiceChannels.length))
          .then(message => voiceChannels(message, collected.first(), filterAuthor, guilds));
      }
      //Signup
      else if(collected.first().content === "2"){
        guilds[message.guild.id].attendanceType = "signup";
        guilds[message.guild.id].voiceChannels = [];
        //Check if PAYOUT WEIGHT has been setup
        if(guilds[message.guild.id].payoutWeight){
          success(message, guilds, 0);
        }
        else{
          //Pass to PAYOUT WEIGHT function
          message.channel.send(lang.payoutWeight[0])
            .then(message => payoutWeight(message, filterAuthor, guilds));
        }
      }
      //If neither option is selected
      else{
        message.channel.send(lang.attendanceType[1])
          .then(message => attendanceType(message, filterAuthor, guilds));
      }
    })
    //if the wait times out (or otherwise errors)
    .catch(x => error(message, 1));
}

//VOICE CHANNELS
function voiceChannels(message, prevCollected, filterAuthor, guilds){
  //Wait for the next message from the person who started setup
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      //delete the prompt and the response
      message.delete();
      collected.first().delete();
      //ADD
      if(collected.first().content === "1"){
        //If author is in a voice channel
        let voiceChannel = prevCollected.guild.members.get(prevCollected.author.id).voiceChannel;
        if(voiceChannel){
          //make sure not to duplicate
          if(!guilds[message.guild.id].voiceChannels.includes(voiceChannel.id)){
            //add voice channel ID to the array
            guilds[message.guild.id].voiceChannels.push(voiceChannel.id);
          }
          //Pass back to VOICE CHANNELS
          message.channel.send(lang.voiceChannels[0].replace("{AMOUNT}", guilds[message.guild.id].voiceChannels.length))
            .then(message => voiceChannels(message, collected.first(), filterAuthor, guilds));
        }
        //Not in a voice channel
        else{
          message.channel.send(lang.voiceChannels[1].replace("{AMOUNT}", guilds[message.guild.id].voiceChannels.length))
            .then(message => voiceChannels(message, collected.first(), filterAuthor, guilds));
        }
      }
      //FINISH
      else if(collected.first().content === "2"){
        //If at least 1 voice channel is registered
        if(guilds[message.guild.id].voiceChannels.length >= 1){
          //Check if PAYOUT WEIGHT has been setup
          if(guilds[message.guild.id].payoutWeight){
            success(message, guilds, 0);
          }
          else{
            //Pass to PAYOUT WEIGHT function
            message.channel.send(lang.payoutWeight[0])
              .then(message => payoutWeight(message, filterAuthor, guilds));
          }
        }
        //If no voice channels are registered
        else{
          message.channel.send(lang.voiceChannels[2].replace("{AMOUNT}", guilds[message.guild.id].voiceChannels.length))
            .then(message => voiceChannels(message, collected.first(), filterAuthor, guilds));
        }
      }
      //If neither option is selected
      else{
        message.channel.send(lang.voiceChannels[3].replace("{AMOUNT}", guilds[message.guild.id].voiceChannels.length))
          .then(message => voiceChannels(message, collected.first(), filterAuthor, guilds));
      }
    })
    //if the wait times out (or otherwise errors)
    .catch(x => error(message, 1));
}

//PAYOUT WEIGHT
function payoutWeight(message, filterAuthor, guilds){
  //Wait for the next message from the person who started setup
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      //delete the prompt and the response
      message.delete();
      collected.first().delete();
      //If one of the options are selected
      if(collected.first().content === "1" || collected.first().content === "2" || collected.first().content === "3"){
        if(guilds[message.guild.id].payoutWeight){
          var x = 0;
        }
        else{
          var x = 1;
        }
        //Balanced
        if(collected.first().content === "1"){
          guilds[message.guild.id].payoutWeight = "balanced";
        }
        //Node Wars
        else if(collected.first().content === "2"){
          guilds[message.guild.id].payoutWeight = "nodeWar";
        }
        //Sea Monster Hunting
        else if(collected.first().content === "3"){
          guilds[message.guild.id].payoutWeight = "seaMonster";
        }
        success(collected.first(), guilds, x);
      }
      //If none of the options are selected
      else{
        message.channel.send(lang.payoutWeight[0])
          .then(message => payoutWeight(message, filterAuthor, guilds));
      }
    })
    //if the wait times out (or otherwise errors)
    .catch(x => error(message, 1));
}


//Success function
function success(message, guilds, x){
  //if the temp keys haven't been created (first time setup)
  if(!("nwRegion" in guilds[message.guild.id])){
    guilds[message.guild.id].nwRegion = "";
    guilds[message.guild.id].nwTier = "0";
    guilds[message.guild.id].nwEnemies = "0";
    guilds[message.guild.id].nwSignUp = "";
    guilds[message.guild.id].botMessages = [];
  }
  var guildsJSON = fs.readFileSync("./guilds.json");
  var write = JSON.parse(guildsJSON);
  write[message.guild.id] = guilds[message.guild.id];
  fs.writeFileSync('guilds.json', JSON.stringify(write, null, 2));
  message.channel.send(lang.success[x]);

  //if tables need to be made
  var query = "SELECT count(*) AS cnt FROM information_schema.TABLES WHERE (TABLE_SCHEMA = ?) AND (TABLE_NAME = ?);";
  sql.query(query, [cred.sql.database, (message.guild.id + "_nodeResults")], function(result){
    if(result[0].cnt === 0){
      sql.create(message.guild.id);
    }
  });
}

//Error function
function error(message, x){
  //delete previous prompt and send error message
  message.channel.send(lang.error[x]);
  if(!message.deleted){
    message.delete();
  }
  //Open guilds json, parse to a varible
  var guildsJSON = fs.readFileSync("./guilds.json");
  var guilds = JSON.parse(guildsJSON);

  //if the error occured during intial setup
  if(Object.keys(guilds[message.guild.id]).length === 0){
    //Remove guild
    delete guilds[message.guild.id];
    fs.writeFileSync('guilds.json', JSON.stringify(guilds, null, 2));
  }
}

//Wait function
function sleeper(ms) {
  return function(x) {
    return new Promise(resolve => setTimeout(() => resolve(x), ms));
  };
}

//EXPORT
module.exports = {
  initialize: initialize,
  guildName: guildName,
  roleMaster: roleMaster,
  roleOfficer: roleOfficer,
  roleMember: roleMember,
  roleVerified: roleVerified,
  channelAnnouncements: channelAnnouncements,
  channelCommands: channelCommands,
  attendanceType: attendanceType,
  payoutWeight: payoutWeight,
};
