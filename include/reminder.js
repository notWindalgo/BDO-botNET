const sql = require("./sql.js");
const date = require("./date.js");

const lang = require("./language.json");

const whiteSpace = "\xa0";

//build list
function build(message, guilds, bot, Discord){
  //--get guild member list
  let fullGuildList = message.guild.members.array();
  fullGuildList = fullGuildList.filter(function(obj){
    return obj._roles.includes(guilds[message.guild.id].roleMember);
  });
  var unverifiedList = fullGuildList.map(result => result.user.id);
  fullGuildList = fullGuildList.map(result => result.user.id);
  //if no members
  if(fullGuildList.length < 1){
    message.channel.send(lang.payoutError[0]);
    return;
  }
  var queryDate = date.dynamic(1);
  var sqlQuery = "SELECT discordID, familyName, updateDate, (CASE WHEN updateDate BETWEEN ? AND CURRENT_DATE THEN 0 ELSE 1 END) AS needUpdate FROM userInfo WHERE discordID IN (?) ORDER BY familyName;";
  var sqlInsert = [queryDate, fullGuildList];
  sql.query(sqlQuery, sqlInsert, function(result){
    var needUpdateString = ("**`Last Update | Family Name " + whiteSpace.repeat(9) + "| Discord Name`**\n");
    var unverifiedString = "**`Discord Name`**\n";
    var needUpdateCount = 0;

    for (var i = 0, len = result.length; i < len; i++){
      //add verified role if missing
      message.guild.members.get(result[i].discordID).addRole(guilds[message.guild.id].roleVerified);
      //remove from list
      unverifiedList.splice(unverifiedList.indexOf(result[i].discordID), 1);
      //add to list if states havent updated in 60 days
      if(result[i].needUpdate == "1" && result[i].updateDate){
        needUpdateCount++;
        //message.guild.members.get(result[i].discordID).send(lang.reminder[4].replace("{GUILDNAME}", guilds[message.guild.id].guildName));
        needUpdateString += ("`" + result[i].updateDate.toLocaleString([], {year: 'numeric', month: '2-digit', day: '2-digit'}) + whiteSpace.repeat(2) + "| " + result[i].familyName + whiteSpace.repeat(20-result[i].familyName.length) + " | " + message.guild.members.get(result[i].discordID).user.username + "#" + message.guild.members.get(result[i].discordID).user.discriminator + "`\n");
      }
    }
    //Unverified
    for (var i = 0, len = unverifiedList.length; i < len; i++){
      //remove verified role if present
      message.guild.members.get(unverifiedList[i]).removeRole(guilds[message.guild.id].roleVerified);
      message.guild.members.get(unverifiedList[i]).send(lang.reminder[3].replace("{GUILDNAME}", guilds[message.guild.id].guildName));
      unverifiedString += ("**`" + message.guild.members.get(unverifiedList[i]).user.username + "`**`#" + message.guild.members.get(unverifiedList[i]).user.discriminator + "`\n");
    }
    //if no reminders are needed
    if((unverifiedList.length + needUpdateCount) == 0){
      message.channel.send(lang.reminder[0]);
    }
    else{
      //Unverified
      if(unverifiedList.length > 0){
        embed = new Discord.RichEmbed()
          .setColor(0x00247d)
          .setAuthor("Unverified Users:", "https://i.imgur.com/UmhMghb.png")
          .setDescription(unverifiedString)
          .setFooter(lang.reminder[1].replace("{COUNT}", unverifiedList.length))

        message.channel.send({embed});
      }
      //Stat updates
      if(needUpdateCount > 0){
        embed = new Discord.RichEmbed()
          .setColor(0x00247d)
          .setAuthor("Out-of-date Users:", "https://i.imgur.com/UmhMghb.png")
          .setDescription(needUpdateString)
          .setFooter(lang.reminder[2].replace("{COUNT}", needUpdateCount))

        message.channel.send({embed});
      }
    }
  });
}

module.exports = {
  build: build,
}
