//Require
const fs = require('fs');
const lang = require("./language.json");

const sql = require("./sql.js");

function node(message, guilds, filterAuthor, bot){
  message.channel.send(lang.nodeWar[0] + (guilds[message.guild.id].nwTier > 0 ? lang.nodeWar[1].replace("{REGION}", guilds[message.guild.id].nwRegion).replace("{TIER}", (guilds[message.guild.id].nwTier == 5 ? "erritory" : guilds[message.guild.id].nwTier)).replace("{ENEMIES}", guilds[message.guild.id].nwEnemies) : ""))
    .then(message => nodeMenu(message, guilds, filterAuthor, bot));
}

//Main Menu
function nodeMenu(message, guilds, filterAuthor, bot){
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      message.delete();
      collected.first().delete();
      //if [1 through 3]
      if(collected.first().content == "1"){
        //Place new fort
        message.channel.send(lang.nodeWar[2])
          .then(message => nodeRegion(message, guilds, filterAuthor, bot));
      }
      else if(collected.first().content == "2"){
        //Enemy count
        //If a tower is already placed
        if(guilds[message.guild.id].nwTier > 0){
          message.channel.send(lang.nodeWar[4])
            .then(message => nodeEnemy(message, guilds, filterAuthor, bot));
        }
        //No tower
        else{
          message.channel.send(lang.nodeError[3]);
        }
      }
      else if(collected.first().content == "3"){
        //Results
        //If there is a fight
        if(guilds[message.guild.id].nwEnemies > 0){
          message.channel.send(lang.nodeWar[5])
            .then(message => nodeResult(message, guilds, filterAuthor, bot));
        }
        else{
          message.channel.send(lang.nodeError[4]);
        }
      }
      else{
        //0 or otherwise
        message.channel.send(lang.nodeError[1]);
      }
    })
    .catch(x => error(message, 0));
}
//Region select
function nodeRegion(message, guilds, filterAuthor, bot){
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      message.delete();
      collected.first().delete();
      //if [1 through 5]
      if(collected.first().content == "1"){
        //Balenos
        guilds[message.guild.id].nwRegion = "Balenos";
      }
      else if(collected.first().content == "2"){
        //Serendia
        guilds[message.guild.id].nwRegion = "Serendia";
      }
      else if(collected.first().content == "3"){
        //Calpheon
        guilds[message.guild.id].nwRegion = "Calpheon";
      }
      else if(collected.first().content == "4"){
        //Mediah
        guilds[message.guild.id].nwRegion = "Mediah";
      }
      else if(collected.first().content == "5"){
        //Valencia
        guilds[message.guild.id].nwRegion = "Valencia";
      }
      else{
        //0 or otherwise
        message.channel.send(lang.nodeError[1]);
        return;
      }
      message.channel.send(lang.nodeWar[3])
        .then(message => nodeTier(message, guilds, filterAuthor, bot));
    })
    .catch(x => error(message, 0));
}
//Tier select
function nodeTier(message, guilds, filterAuthor, bot){
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      message.delete();
      collected.first().delete();
      //if [1 through 5]
      if(isFinite(collected.first().content) && collected.first().content >= 1 && collected.first().content <= 5){
        guilds[message.guild.id].nwTier = collected.first().content;
      }
      else{
        //0 or otherwise
        message.channel.send(lang.nodeError[1]);
        return;
      }
      //clear previous announcements
      if(guilds[message.guild.id].botMessages.length > 0){
        var i;
        for(i = 0; i < guilds[message.guild.id].botMessages.length; i++){
          bot.channels.get(guilds[message.guild.id].channelAnnouncements).fetchMessage(guilds[message.guild.id].botMessages[i])
            .then(message => message.delete());
        }
        guilds[message.guild.id].botMessages = [];
      }
      //announcements
      //if signup attendance
      if(guilds[message.guild.id].attendanceType == "signup"){
        bot.channels.get(guilds[message.guild.id].channelAnnouncements).send(lang.nodeAlerts[1].replace("{REGION}", guilds[message.guild.id].nwRegion))
          .then(message => {
            message.react("✅")
              .then(x => message.react("⛔"));
            guilds[message.guild.id].nwSignUp = message.id;
            guilds[message.guild.id].botMessages.push(message.id);
            success(message, guilds);
          });
      }
      //if voice comms attendance
      else{
        bot.channels.get(guilds[message.guild.id].channelAnnouncements).send(lang.nodeAlerts[0].replace("{REGION}", guilds[message.guild.id].nwRegion))
          .then(message => {
            guilds[message.guild.id].botMessages.push(message.id);
            success(message, guilds);
          });
      }
      message.channel.send(lang.nodeSuccess[0].replace("{NAME}", guilds[message.guild.id].guildName).replace("{REGION}", guilds[message.guild.id].nwRegion).replace("{TIER}", (guilds[message.guild.id].nwTier == 5 ? "erritory" : guilds[message.guild.id].nwTier)).replace("{ENEMIES}", guilds[message.guild.id].nwEnemies));
    })
    .catch(x => error(message, 0));
}
//Enemy count
function nodeEnemy(message, guilds, filterAuthor, bot){
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      message.delete();
      collected.first().delete();
      if(isFinite(collected.first().content) && collected.first().content >= 0 && collected.first().content < 30){
        //Number in range
        if(guilds[message.guild.id].nwEnemies == 0 && collected.first().content > 0){
          //send announcement
          bot.channels.get(guilds[message.guild.id].channelAnnouncements).send(lang.nodeAlerts[2].replace("{REGION}", guilds[message.guild.id].nwRegion))
            .then(message => {
              guilds[message.guild.id].botMessages.push(message.id);
              guilds[message.guild.id].nwEnemies = collected.first().content;
              success(message, guilds);
            })
            .then(x => message.channel.send(lang.nodeSuccess[0].replace("{NAME}", guilds[message.guild.id].guildName).replace("{REGION}", guilds[message.guild.id].nwRegion).replace("{TIER}", (guilds[message.guild.id].nwTier == 5 ? "erritory" : guilds[message.guild.id].nwTier)).replace("{ENEMIES}", guilds[message.guild.id].nwEnemies)));
        }
        else{
          guilds[message.guild.id].nwEnemies = collected.first().content;
          message.channel.send(lang.nodeSuccess[0].replace("{NAME}", guilds[message.guild.id].guildName).replace("{REGION}", guilds[message.guild.id].nwRegion).replace("{TIER}", (guilds[message.guild.id].nwTier == 5 ? "erritory" : guilds[message.guild.id].nwTier)).replace("{ENEMIES}", guilds[message.guild.id].nwEnemies));
          success(message, guilds);
        }
      }
      else{
        //no good
        message.channel.send(lang.nodeError[2]);
      }
    })
    .catch(x => error(message, 0));
}
//Node Result
function nodeResult(message, guilds, filterAuthor, bot){
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      message.delete();
      collected.first().delete();
      //if 1 or 2
      if(collected.first().content == "1"){
        //win
        var nodeResult = "win";
      }
      else if(collected.first().content == "2"){
        //lose
        var nodeResult = "lose";
      }
      else{
        //0 or otherwise
        message.channel.send(lang.nodeError[1]);
        return;
      }
      attendance(message, guilds, nodeResult, bot);
    })
    .catch(x => error(message, 0));
}

//Guild Event Attendance
function guildEvent(){

}

function attendance(message, guilds, nodeResult, bot){
  //V O I C E C O M M S
  if(guilds[message.guild.id].attendanceType == "comms"){
    var voiceMembers = bot.channels.get(guilds[message.guild.id].voiceChannels[0]).members.array();
    //if multiple voice channels
    if(guilds[message.guild.id].voiceChannels.length > 1){
      var i;
      for(i = 1; i < guilds[message.guild.id].voiceChannels.length; i++){
        voiceMembers = voiceMembers.concat(bot.channels.get(guilds[message.guild.id].voiceChannels[i]).members.array());
      }
    }
    if(voiceMembers.length > 0){
      var attendance = [];
      var date = new Date();
      var sqlResult = "INSERT INTO ?? (nodeDate, nodeRegion, nodeTier, nodeMembers, nodeEnemies, nodeResult) VALUES (?, ?, ?, ?, ?, ?)";
      var insertResult = [(message.guild.id + "_nodeResults"), date, guilds[message.guild.id].nwRegion, guilds[message.guild.id].nwTier, voiceMembers.length, guilds[message.guild.id].nwEnemies, nodeResult];
      //Enter Result, get ID for attendance
      sql.query(sqlResult, insertResult, function(result){
        let nodeID = result.insertId;
        //--update nodeAttendance table
        var sqlAttendance = "INSERT INTO ?? (nodeID, nodeDate, discordID) VALUES ?";
        var insertAttendance = [];
        for (var i = 0; i < voiceMembers.length; i++){
          insertAttendance.push([nodeID, date, voiceMembers[i].user.id]);
        }
        sql.edit(sqlAttendance, [(message.guild.id + "_nodeAttendance"), insertAttendance]);
      });
      //Delete messages
      if(guilds[message.guild.id].botMessages.length > 0){
        var i;
        for(i = 0; i < guilds[message.guild.id].botMessages.length; i++){
          bot.channels.get(guilds[message.guild.id].channelAnnouncements).fetchMessage(guilds[message.guild.id].botMessages[i])
            .then(message => message.delete());
        }
      }
      //Clear json variables
      guilds[message.guild.id].nwRegion = "";
      guilds[message.guild.id].nwTier = "0";
      guilds[message.guild.id].nwEnemies = "0";
      guilds[message.guild.id].nwSignUp = "";
      guilds[message.guild.id].botMessages = [];
      //save json
      success(message, guilds);
      message.channel.send(lang.nodeSuccess[1].replace("{MEMBERS}", voiceMembers.length).replace("{RESULT}", nodeResult));
    }
    //nobody in voice chat
    else{
      message.channel.send(lang.nodeError[5]);
    }
  }

  //S I G N U P
  else{
    bot.channels.get(guilds[message.guild.id].channelAnnouncements).fetchMessage(guilds[message.guild.id].nwSignUp)
      .then(announcement => {
        announcement.reactions.get("✅").fetchUsers()
          .then(reactions => {
            var attendance = reactions.array();
            //if members have signed up
            if(attendance.length > 1){
              var date = new Date();
              var sqlResult = "INSERT INTO ?? (nodeDate, nodeRegion, nodeTier, nodeMembers, nodeEnemies, nodeResult) VALUES (?, ?, ?, ?, ?, ?)";
              var insertResult = [(message.guild.id + "_nodeResults"), date, guilds[message.guild.id].nwRegion, guilds[message.guild.id].nwTier, (attendance.length - 1), guilds[message.guild.id].nwEnemies, nodeResult];
              //Enter Result, get ID for attendance
              sql.query(sqlResult, insertResult, function(result){
                let nodeID = result.insertId;
                //--update nodeAttendance table
                var sqlAttendance = "INSERT INTO ?? (nodeID, nodeDate, discordID) VALUES ?";
                var insertAttendance = [];
                for (var i = 0; i < attendance.length; i++){
                  if(!attendance[i].bot){
                    insertAttendance.push([nodeID, date, attendance[i].id]);
                  }
                }
                sql.edit(sqlAttendance, [(message.guild.id + "_nodeAttendance"), insertAttendance]);
              });
              //Delete messages
              if(guilds[message.guild.id].botMessages.length > 0){
                var i;
                for(i = 0; i < guilds[message.guild.id].botMessages.length; i++){
                  bot.channels.get(guilds[message.guild.id].channelAnnouncements).fetchMessage(guilds[message.guild.id].botMessages[i])
                    .then(message => message.delete());
                }
              }
              //Clear json variables
              guilds[message.guild.id].nwRegion = "";
              guilds[message.guild.id].nwTier = "0";
              guilds[message.guild.id].nwEnemies = "0";
              guilds[message.guild.id].nwSignUp = "";
              guilds[message.guild.id].botMessages = [];
              //save json
              success(message, guilds);
              message.channel.send(lang.nodeSuccess[1].replace("{MEMBERS}", (attendance.length - 1)).replace("{RESULT}", nodeResult));
            }
            //no signup
            else{
              message.channel.send(lang.nodeError[6]);
            }
          }
      )});
  }
}

//Success function
function success(message, guilds){
  var guildsJSON = fs.readFileSync("./guilds.json");
  var write = JSON.parse(guildsJSON);
  write[message.guild.id] = guilds[message.guild.id];
  fs.writeFileSync('guilds.json', JSON.stringify(write, null, 2));
}

//Error function
function error(message, x){
  //delete previous prompt and send error message
  message.channel.send(lang.nodeError[x]);
  if(message && !message.deleted){
    message.delete();
  }
}

module.exports = {
  node: node,
  guildEvent: guildEvent,
}
