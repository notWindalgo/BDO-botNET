const sql = require("./sql.js");
const lang = require("./language.json");

const whiteSpace = "\xa0";

//NODE WAR
function nodeWar(message, filterAuthor, Discord){
  var sqlQuery = "SELECT * FROM ?? ORDER BY nodeID DESC LIMIT 9";
  sql.query(sqlQuery, (message.guild.id + "_nodeResults"), function(result){
    if(result && result.length > 0){
      //--go through list
      var auditString = "**`key | Date" + whiteSpace.repeat(7) + "| Region | Tier | Attendance | Enemies | Result`**\n";
      for(var i = 0; i < result.length; i++){
        auditString += ("`[" + (i+1) + "] | " + result[i].nodeDate.toLocaleString([], {year: 'numeric', month: '2-digit', day: '2-digit'}) + " | " + result[i].nodeRegion.substring(0, 3) + whiteSpace.repeat(4) + "| T" + result[i].nodeTier + whiteSpace.repeat(3) + "| " + ("00" + result[i].nodeMembers).slice(-3) + whiteSpace.repeat(8) + "| " + ("0" + result[i].nodeEnemies).slice(-2) + whiteSpace.repeat(6) + "|" + whiteSpace.repeat(3) + result[i].nodeResult + "`\n");
      }
      auditString += lang.auditFooter[2];
      embed = new Discord.RichEmbed()
        .setColor(0x00247d)
        .setAuthor("Recent Node War information", "https://i.imgur.com/UmhMghb.png")
        .setDescription(auditString)
        .setFooter(lang.auditFooter[0])

      message.channel.send({embed})
        .then(message => nodeEdit(message, filterAuthor, result, Discord));
    }
    //No node wars on record
    else{
      message.channel.send(lang.auditError[0]);
    }
  });
}

function nodeEdit(message, filterAuthor, result, Discord){
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      //if 1 - 9, and a valid result
      if(collected.first().content > 0 && collected.first().content < 10 && result[collected.first().content - 1]){
        var selection = result[collected.first().content - 1];
        message.channel.send(lang.auditGuildNode[0].replace("{NODEID}", selection.nodeID).replace("{DATE}", selection.nodeDate.toLocaleString([], {year: 'numeric', month: '2-digit', day: '2-digit'})).replace("{ATTENDANCE}", selection.nodeMembers).replace("{REGION}", selection.nodeRegion).replace("{TIER}", (selection.nodeTier == 5 ? "erritory" : selection.nodeTier)).replace("{ENEMIES}", selection.nodeEnemies).replace("{RESULT}", selection.nodeResult))
          .then(message => nodeOptions(message, filterAuthor, selection, Discord));
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

function nodeOptions(message, filterAuthor, selection, Discord){
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
  .then(collected => {
    if(collected.first().content == "1"){
      //Attendance List
      var sqlAttendance = "SELECT ??.nodeID, userInfo.discordID, userInfo.familyName FROM userInfo LEFT JOIN ?? ON userInfo.discordID = ??.discordID WHERE nodeID = ? ORDER BY familyName;";
      var insertAttendance = [(message.guild.id + "_nodeAttendance"), (message.guild.id + "_nodeAttendance"), (message.guild.id + "_nodeAttendance"), selection.nodeID];
      sql.query(sqlAttendance, insertAttendance, function(result){
        var attendanceString = "**`key | Family Name`**\n";
        for(var i = 0; i < result.length; i++){
          attendanceString += ("`[" + (i+1) + "] | " + result[i].familyName + "`\n");
        }
        attendanceString += lang.auditFooter[2];
        embed = new Discord.RichEmbed()
          .setColor(0x00247d)
          .setAuthor("Node War Attendance", "https://i.imgur.com/UmhMghb.png")
          .setDescription(attendanceString)
          .setFooter(lang.auditFooter[1])

        message.channel.send({embed})
          .then(message => nodeAttendance(message, filterAuthor, selection, result, Discord));
      });
    }
    else if(collected.first().content == "2"){
      //Remove record
      message.channel.send(lang.auditGuildNode[2].replace("{NODEID}", selection.nodeID))
        .then(message => removeRecord(message, filterAuthor, selection));
    }
    else if(collected.first().content == "3"){
      //Change Region
      message.channel.send(lang.nodeWar[2])
        .then(message => changeRegion(message, filterAuthor, selection));
    }
    else if(collected.first().content == "4"){
      //Change Tier
      message.channel.send(lang.nodeWar[3])
        .then(message => changeTier(message, filterAuthor, selection));
    }
    else if(collected.first().content == "5"){
      //Change Enemy Count
      message.channel.send(lang.nodeWar[4])
        .then(message => enemyCount(message, filterAuthor, selection));
    }
    else if(collected.first().content == "6"){
      //Change Result
      message.channel.send(lang.nodeWar[5])
        .then(message => changeResult(message, filterAuthor, selection));
    }
    else{
      message.channel.send(lang.auditError[1]);
    }
    message.delete();
    collected.first().delete();
  })
  .catch(x => error(message, 2));
}
//Node
function nodeAttendance(message, filterAuthor, selection, result, Discord){
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
  .then(collected => {
    if(isFinite(collected.first().content) && result[collected.first().content - 1]){
      var nodeMember = result[collected.first().content - 1];
      message.channel.send(lang.auditGuildNode[1].replace("{FAMILYNAME}", nodeMember.familyName).replace("{NODEID}", selection.nodeID))
        .then(message => nodeAttendanceRemove(message, filterAuthor, selection, nodeMember));
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
//Node Attendance Remove
function nodeAttendanceRemove(message, filterAuthor, selection, nodeMember){
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      if(collected.first().content.toLowerCase().startsWith("y")){
        //REMOVE
        var sqlPlayer = "DELETE FROM ?? WHERE discordID = ? AND nodeID = ?";
        var insertPlayer = [(message.guild.id + "_nodeAttendance"), nodeMember.discordID, selection.nodeID];
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
//Remove Attendance Record
function removeRecord(message, filterAuthor, selection){
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      //y
      if(collected.first().content.toLowerCase().startsWith("y")){
        var sqlRemove = "DELETE FROM ?? WHERE nodeID = ?";
        var insertRemoveResults = [(message.guild.id + "_nodeResults"), selection.nodeID];
        var insertRemoveAttendance = [(message.guild.id + "_nodeAttendance"), selection.nodeID];
        sql.edit(sqlRemove, insertRemoveResults);
        sql.edit(sqlRemove, insertRemoveAttendance);
        message.channel.send(lang.auditGuildNode[3]);
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
//Change Region
function changeRegion(message, filterAuthor, selection){
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      //1-5
      if(collected.first().content == "1"){
          var nodeRegion = "Balenos";
      }
      else if(collected.first().content == "2"){
          var nodeRegion = "Serendia";
      }
      else if(collected.first().content == "3"){
          var nodeRegion = "Calpheon";
      }
      else if(collected.first().content == "4"){
          var nodeRegion = "Mediah";
      }
      else if(collected.first().content == "5"){
          var nodeRegion = "Valencia";
      }
      //0 or otherwise
      else{
        message.channel.send(lang.auditError[1]);
        return;
      }
      //update SQL
      var sqlRegion = "UPDATE ?? SET nodeRegion = ? WHERE nodeID = ?";
      var insertRegion = [(message.guild.id + "_nodeResults"), nodeRegion, selection.nodeID];
      sql.edit(sqlRegion, insertRegion);
      message.channel.send(lang.auditGuildNode[4]);

      message.delete();
      collected.first().delete();
    })
    .catch(x => error(message, 2));
}
//Change Tier
function changeTier(message, filterAuthor, selection){
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      //1-5
      if(isFinite(collected.first().content) && collected.first().content >= 1 && collected.first().content <= 5){
        var sqlTier = "UPDATE ?? SET nodeTier = ? WHERE nodeID = ?";
        var insertTier = [(message.guild.id + "_nodeResults"), collected.first().content, selection.nodeID];
        sql.edit(sqlTier, insertTier);
        message.channel.send(lang.auditGuildNode[4]);
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
//Change Enemy Count
function enemyCount(message, filterAuthor, selection){
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      if(isFinite(collected.first().content) && collected.first().content >= 1 && collected.first().content < 30){
        var sqlEnemies = "UPDATE ?? SET nodeEnemies = ? WHERE nodeID = ?";
        var insertEnemies = [(message.guild.id + "_nodeResults"), collected.first().content, selection.nodeID];
        sql.edit(sqlEnemies, insertEnemies);
        message.channel.send(lang.auditGuildNode[4]);
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
//Change Result
function changeResult(message, filterAuthor, selection){
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      //1-2
      if(collected.first().content == "1"){
          var nodeResult = "win";
      }
      else if(collected.first().content == "2"){
          var nodeResult = "lose";
      }
      //0 or otherwise
      else{
        message.channel.send(lang.auditError[1]);
        return;
      }
      //update SQL
      var sqlResult = "UPDATE ?? SET nodeResult = ? WHERE nodeID = ?";
      var insertResult = [(message.guild.id + "_nodeResults"), nodeResult, selection.nodeID];
      sql.edit(sqlResult, insertResult);
      message.channel.send(lang.auditGuildNode[4]);

      message.delete();
      collected.first().delete();
    })
    .catch(x => error(message, 2));
}



//SEA MONSTER
function seaMonster(message, filterAuthor, Discord){
  var sqlQuery = "SELECT lootID, lootDate, lootAmount, lootAudit, userInfo.discordID, userInfo.familyName FROM userInfo RIGHT JOIN ?? ON userInfo.discordID = ??.discordID ORDER BY lootID DESC LIMIT 9;";
  sql.query(sqlQuery, [(message.guild.id + "_seaLoot"), (message.guild.id + "_seaLoot")], function(result){
    if(result && result.length > 0){
      //--go through list
      var auditString = ("**`key | Date" + whiteSpace.repeat(7) + "| Family Name" + whiteSpace.repeat(10) + "|" + whiteSpace.repeat(6) + "Amount`**\n");
      for(var i = 0; i < result.length; i++){
        var tmpAuditString = ("`[" + (i+1) + "] | " + result[i].lootDate.toLocaleString([], {year: 'numeric', month: '2-digit', day: '2-digit'}) + " | " + result[i].familyName + whiteSpace.repeat(20 - result[i].familyName.length) + " | `[`" + result[i].lootAmount.toLocaleString() + "`](" + result[i].lootAudit +")\n");
        if((tmpAuditString.length + auditString.length) < 2024){
          auditString += tmpAuditString;
        }
      }
      auditString += lang.auditFooter[2];
      embed = new Discord.RichEmbed()
        .setColor(0x00247d)
        .setAuthor("Recent Sea Haul information", "https://i.imgur.com/UmhMghb.png")
        .setDescription(auditString)
        .setFooter(lang.auditFooter[3])

      message.channel.send({embed})
        .then(message => seaRemove(message, filterAuthor, result));
    }
    //No node wars on record
    else{
      message.channel.send(lang.auditError[3]);
    }
  });
}
//Sea Haul Remove
function seaRemove(message, filterAuthor, result){
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      //if 1 - 9, and a valid result
      if(collected.first().content > 0 && collected.first().content < 10 && result[collected.first().content - 1]){
        var selection = result[collected.first().content - 1];
        message.channel.send(lang.auditGuildSea[0].replace("{SEAID}", selection.lootID).replace("{FAMILYNAME}", selection.familyName))
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
//Sea Haul Remove Confirm
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
  nodeWar: nodeWar,
  seaMonster: seaMonster,
}
