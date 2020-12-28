const lang = require("./language.json");

const sql = require("./sql.js");
const renown = require("./renown.js");

//Verify Family Name
function verify(message, name, guilds){
  if(name){
    if(name.length > 20){
      message.channel.send(lang.verify[3]);
      return;
    }
    message.guild.members.get(message.author.id).addRole(guilds[message.guild.id].roleVerified);
    var query = "SELECT count(*) AS cnt FROM userInfo WHERE discordID = ?;";
    sql.query(query, [message.author.id], function(result){
      if(result[0].cnt === 0){
        var insert = "INSERT INTO userInfo (discordID, familyName) VALUES (?, ?)";
        sql.edit(insert, [message.author.id, name]);
        message.channel.send(lang.verify[0].replace("{NAME}", name));
      }
      else{
        var insert = "UPDATE userInfo SET familyName = ? WHERE discordID = ?";
        sql.edit(insert, [name, message.author.id]);
        message.channel.send(lang.verify[1].replace("{NAME}", name));
      }
    });
  }
  else{
    message.channel.send(lang.verify[2]);
  }
}

//Update Stats
function stats(message, guilds){
  let statsSplit = message.content.split(" ");
  var date = new Date();

  //Stats given, but no class
  if(statsSplit.length === 4){
    var statsAP = statsSplit[1];
    var statsAAP = statsSplit[2];
    var statsDP = statsSplit[3];
    var insert = "UPDATE userInfo SET statsAP = ?, statsAAP = ?, statsDP = ?, updateDate = ? WHERE discordID = ?";
    var insertVars = [statsAP, statsAAP, statsDP, date, message.author.id];
  }
  //Class given
  else if(statsSplit.length === 5){
    var statsClass = statsSplit[1].toLowerCase();
    var statsAP = statsSplit[2];
    var statsAAP = statsSplit[3];
    var statsDP = statsSplit[4];
    if (statsClass.includes("war") || statsClass.includes("valk") || statsClass.includes("ranger") || statsClass.includes("sorc") || statsClass.includes("erker") || statsClass.includes("giant") || statsClass.includes("wiz") || statsClass.includes("witch") || statsClass.includes("tamer") || statsClass.includes("musa") || statsClass.includes("mae") || statsClass.includes("ninja") || statsClass.includes("kuno") || statsClass.includes("dark") || statsClass.includes("dk") || statsClass.includes("striker") || statsClass.includes("mystic") || statsClass.includes("lahn") || statsClass.includes("archer") || statsClass.includes("shai") || statsClass.includes("guard") || statsClass.includes("hash") || statsClass.includes("nova")){
      var statsClassFull = renown.renownClassName(statsClass);
      var insert = "UPDATE userInfo SET className = ?, statsAP = ?, statsAAP = ?, statsDP = ?, updateDate = ? WHERE discordID = ?";
      var insertVars = [statsClassFull, statsAP, statsAAP, statsDP, date, message.author.id];
    }
    //Class isn't on list
    else{
      message.channel.send(lang.stats[4]);
      return;
    }
  }
  //More or less parameters given than expected
  else{
    message.channel.send(lang.stats[5]);
    return;
  }
  //Invalid stats given
  if([statsAP, statsAAP, statsDP].some(x => !isFinite(x) || +x > 500 || +x < -1) || [statsAP, statsDP].some(x => +x < 1)){
    message.channel.send(lang.stats[3]);
    return;
  }
  //Everything checks out
  var query = "SELECT * FROM userInfo WHERE discordID = ?";
  sql.query(query, [message.author.id], function(result){
    if(result[0]){
      //No class name on record or provided
      if(result[0].className == null && !statsClassFull){
          message.channel.send(lang.stats[2]);
      }
      //Class name provided or not needed
      else{
        sql.edit(insert, insertVars);
        message.channel.send(lang.stats[0].replace("{NAME}", result[0].familyName));
      }
    }
    //No Result
    else{
      message.channel.send(lang.stats[1]);
    }
  });
}

//Sea Monster reports
function seaLoot(message, parameters, filterAuthor){
  let discordID = message.author.id;
  let discordName = message.author.username;
  let lootAmount = parameters.replace(/,\s?/g, "");
  //if given a number
  if(isFinite(lootAmount) && lootAmount > 1 && lootAmount < 2100000000){
    message.channel.send(lang.seaLoot[0].replace("{AMOUNT}", lootAmount.toLocaleString()).replace("{NAME}", discordName))
      .then(message => seaLootLink(message, discordID, lootAmount, discordName, filterAuthor));
  }
  //no number or extra information
  else{
    message.channel.send(lang.seaLoot[1]);
  }
}
//Get Link
function seaLootLink(message, discordID, lootAmount, discordName, filterAuthor){
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      message.delete();
      //If the image is uploaded to discord
      if(collected.first().attachments.size == 1){
        var lootAudit = collected.first().attachments.first().url;
      }
      //If the image is a url
      else if(collected.first().embeds[0] && collected.first().embeds[0].type == "image"){
        var lootAudit = collected.first().embeds[0].url;
      }
      //Neither
      else{
        collected.first().delete();
        message.channel.send(lang.seaLoot[2]);
        return;
      }
      var date = new Date();
      var insert = "INSERT INTO ?? (lootDate, discordID, lootAmount, lootAudit) VALUES (?, ?, ?, ?)";
      var insertVars = [(message.guild.id + "_seaLoot"), date, discordID, lootAmount, lootAudit];
      sql.edit(insert, insertVars);
      message.channel.send(lang.seaLoot[4].replace("{AMOUNT}", lootAmount.toLocaleString()).replace("{NAME}", discordName));
    })
    .catch(x => error(message));
}
//Error message for sea monster await
function error(message){
  message.delete();
  message.channel.send(lang.seaLoot[3]);
}

module.exports = {
  verify: verify,
  stats: stats,
  seaLoot: seaLoot,
}
