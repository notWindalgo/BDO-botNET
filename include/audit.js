const sql = require("./sql.js");
const lang = require("./language.json");

const whiteSpace = "\xa0";

//Check if valid player
function playerCheck(message, parameters, filterAuthor, Discord){
  if(parameters){
    var messageMentions = message.mentions.users.array();
    //--if command was used with a discord @
    if(messageMentions.length > 0){
      var insertInfo = messageMentions[0].id;
      var statUsername = messageMentions[0].username;
      var sqlInfo = "SELECT * FROM userInfo WHERE discordID = ?";
    }
    //--if command was used with a family name
    else {
      var insertInfo = parameters;
      var statUsername = parameters;
      var sqlInfo = "SELECT * FROM userInfo WHERE familyName = ?";
    }
    sql.query(sqlInfo, insertInfo, function(result){
      if(result[0] && result[0].familyName){
        var userInfo = result[0];
        //--if user has verified
        message.channel.send(lang.optionsAudit[1].replace("{FAMILYNAME}", userInfo.familyName))
          .then(message => auditMenu(message, userInfo, filterAuthor, Discord));
      }
      //--no result
      else{
        message.channel.send(lang.auditPlayerError[0].replace("{USERNAME}", statUsername));
      }
      message.delete();
    });
  }
  //--no parameters
  else{
    message.channel.send(lang.auditPlayerError[1]);
  }
}

//Audit Menu
function auditMenu(message, userInfo, filterAuthor, Discord){
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      //NODE WAR
      if(collected.first().content == "1"){
        var sqlQuery = "SELECT ??.nodeID, ??.nodeDate, nodeRegion, nodeTier, nodeMembers, nodeEnemies, nodeResult FROM ?? LEFT JOIN ?? ON ??.nodeID = ??.nodeID WHERE discordID = ? ORDER BY nodeID DESC LIMIT 9;";
        var sqlInsert = [(message.guild.id + "_nodeResults"), (message.guild.id + "_nodeResults"), (message.guild.id + "_nodeAttendance"), (message.guild.id + "_nodeResults"), (message.guild.id + "_nodeResults"), (message.guild.id + "_nodeAttendance"), userInfo.discordID];
        sql.query(sqlQuery, sqlInsert, function(result){
          if(result && result.length > 0){
            //--go through list
            var auditString = ("**`key | Date" + whiteSpace.repeat(7) + "| Region | Tier | Attendance | Enemies | Result`**\n");
            for(var i = 0; i < result.length; i++){
              auditString += ("`[" + (i+1) + "] | " + result[i].nodeDate.toLocaleString([], {year: 'numeric', month: '2-digit', day: '2-digit'}) + " | " + result[i].nodeRegion.substring(0, 3) + whiteSpace.repeat(4) + "| T" + result[i].nodeTier + whiteSpace.repeat(3) + "| " + ("00" + result[i].nodeMembers).slice(-3) + whiteSpace.repeat(8) + "| " + ("0" + result[i].nodeEnemies).slice(-2) + whiteSpace.repeat(6) + "|" + whiteSpace.repeat(3) + result[i].nodeResult + "`\n");
            }
            auditString += lang.auditFooter[2];
            embed = new Discord.RichEmbed()
              .setColor(0x00247d)
              .setAuthor("Recent Node War information for " + userInfo.familyName, "https://i.imgur.com/UmhMghb.png")
              .setDescription(auditString)
              .setFooter(lang.auditFooter[4])

            message.channel.send({embed})
              .then(message => nodeInformation(message, userInfo, filterAuthor, result));
          }
          //no results
          else{
            message.channel.send(lang.auditPlayerError[2].replace("{FAMILYNAME}", userInfo.familyName));
          }
        });
      }
      //SEA LOOT
      else if(collected.first().content == "2"){
        var sqlQuery = "SELECT * FROM ?? WHERE discordID = ? ORDER BY lootID DESC LIMIT 9;";
        var sqlInsert = [(message.guild.id + "_seaLoot"), userInfo.discordID];
        sql.query(sqlQuery, sqlInsert, function(result){
          if(result && result.length > 0){
            //--go through list
            var auditString = ("**`key | Date" + whiteSpace.repeat(7) + "|" + whiteSpace.repeat(6) + "Amount`**\n");
            for(var i = 0; i < result.length; i++){
              var tmpAuditString = ("`[" + (i+1) + "] | " + result[i].lootDate.toLocaleString([], {year: 'numeric', month: '2-digit', day: '2-digit'}) + " | `[`" + result[i].lootAmount.toLocaleString() + "`](" + result[i].lootAudit +")\n");
              if((tmpAuditString.length + auditString.length) < 2024){
                auditString += tmpAuditString;
              }
            }
            auditString += lang.auditFooter[2];
            embed = new Discord.RichEmbed()
              .setColor(0x00247d)
              .setAuthor("Recent Sea Haul information for " + userInfo.familyName, "https://i.imgur.com/UmhMghb.png")
              .setDescription(auditString)
              .setFooter(lang.auditFooter[3])

            message.channel.send({embed})
              .then(message => seaInformation(message, userInfo, filterAuthor, result));
          }
          //no results
          else{
            message.channel.send(lang.auditPlayerError[2].replace("{FAMILYNAME}", userInfo.familyName));
          }
        });
      }
      //0 or otherwise
      else{
        message.channel.send(lang.auditError[1]);
      }
      message.delete();
      collected.first().delete();
    })
    //if the wait times out (or otherwise errors)
    .catch(x => error(message, 2));
}

//list of node wars to remove
function nodeInformation(message, userInfo, filterAuthor, result){
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      //if 1 - 9, and a valid result
      if(collected.first().content > 0 && collected.first().content < 10 && result[collected.first().content - 1]){
        var selection = result[collected.first().content - 1];
        message.channel.send(lang.auditPlayerNode[0].replace("{FAMILYNAME}", userInfo.familyName).replace("{NODEID}", selection.nodeID))
          .then(message => nodeRemoveConfirm(message, userInfo, filterAuthor, selection));
      }
      //0 or otherwise
      else{
        message.channel.send(lang.auditError[1]);
      }
      message.delete();
      collected.first().delete();
    })
    .catch(x => error(message, 2));
}

//confirm removal node war
function nodeRemoveConfirm(message, userInfo, filterAuthor, selection){
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      if(collected.first().content.toLowerCase().startsWith("y")){
        //REMOVE
        var sqlPlayer = "DELETE FROM ?? WHERE discordID = ? AND nodeID = ?";
        var insertPlayer = [(message.guild.id + "_nodeAttendance"), userInfo.discordID, selection.nodeID];
        var sqlMembers = "UPDATE ?? SET nodeMembers = ? WHERE nodeID = ?";
        var insertMembers = [(message.guild.id + "_nodeResults"), (selection.nodeMembers - 1), selection.nodeID];
        sql.edit(sqlPlayer, insertPlayer);
        sql.edit(sqlMembers, insertMembers);
        message.channel.send(lang.auditGuildNode[4]);
      }
      else{
        message.channel.send(lang.auditError[1]);
      }
      message.delete();
      collected.first().delete();
    })
    //if the wait times out (or otherwise errors)
    .catch(x => error(message, 2));
}

//list of sea hauls to remove
function seaInformation(message, userInfo, filterAuthor, result){
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      //if 1 - 9, and a valid result
      if(collected.first().content > 0 && collected.first().content < 10 && result[collected.first().content - 1]){
        var selection = result[collected.first().content - 1];
        message.channel.send(lang.auditPlayerSea[0].replace("{SEAID}", selection.lootID).replace("{FAMILYNAME}", userInfo.familyName))
          .then(message => seaRemoveConfirm(message, filterAuthor, selection));
      }
      //0 or otherwise
      else{
        message.channel.send(lang.auditError[1]);
      }
      message.delete();
      collected.first().delete();
    })
    .catch(x => error(message, 2));
}

//confirm removal sea loot
function seaRemoveConfirm(message, filterAuthor, selection){
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      //y
      if(collected.first().content.toLowerCase().startsWith("y")){
        var sqlRemove = "DELETE FROM ?? WHERE lootID = ?";
        var insertRemove = [(message.guild.id + "_seaLoot"), selection.lootID];
        sql.edit(sqlRemove, insertRemove);
        message.channel.send(lang.auditGuildSea[1]);
      }
      else{
        message.channel.send(lang.auditError[1]);
      }
      message.delete();
      collected.first().delete();
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
  playerCheck: playerCheck,
}
