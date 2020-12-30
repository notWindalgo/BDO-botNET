const date = require("./date.js");
const renown = require("./renown.js");

const sql = require("./sql.js");
const payout = require("./payout.js");
const tax = require("./tax.json");
const lang = require("./language.json");

function player(message, parameters, guilds, Discord){
  if(parameters){
    //--get dates for queries
    var queryDateWeek = date.week();
    var queryDateMonth = date.month();
    //--get mentions from message
    var messageMentions = message.mentions.users.array();
    //--if command was used with a discord @
    if(messageMentions.length > 0){
      var insertInfo = messageMentions[0].id;
      var statUsername = messageMentions[0].username;
      var userDiscordCreated = " |  Discord created: " + messageMentions[0].createdAt.toLocaleString([], {year: 'numeric', month: '2-digit', day: '2-digit'});
      var sqlInfo = "SELECT * FROM userInfo WHERE discordID = ?";
    }
    //--if command was used with a family name
    else {
      var insertInfo = parameters;
      var statUsername = parameters;
      var userDiscordCreated = "";
      var sqlInfo = "SELECT * FROM userInfo WHERE familyName = ?";
    }
    sql.query(sqlInfo, insertInfo, function(result){
      if(result[0]){
        //--get guild member list
        let fullGuildList = message.guild.members.array();
        fullGuildList = fullGuildList.filter(function(obj){
          return obj._roles.includes(guilds[message.guild.id].roleMember);
        });
        fullGuildList = fullGuildList.map(result => result.user.id);
        //if no members
        if(fullGuildList.length < 1){
          message.channel.send(lang.checkError[0]);
          return;
        }
        //if user doesnt have a member tag
        if(!fullGuildList.includes(result[0].discordID)){
          message.channel.send(lang.checkError[1].replace("{USERNAME}", statUsername).replace("{DISCORDCREATED}", userDiscordCreated));
          return;
        }
        var userID = result[0].discordID;
        var userFamilyName = result[0].familyName;
        if (result[0].statsAP){
          var userUpdateTime = result[0].updateDate.toLocaleString([], {year: 'numeric', month: '2-digit', day: '2-digit'});
          var userClass = result[0].className;
          var userAP = result[0].statsAP;
          var userAAP = result[0].statsAAP;
          var userDP = result[0].statsDP;
        }
      }
      //--if user has verified
      if(userFamilyName){
        //--grab all node war and sea information overall and for user being checked
        var sqlStats = "SELECT (SELECT COUNT(*) FROM ?? WHERE nodeDate BETWEEN ? AND CURRENT_DATE) AS monthlyWars, (SELECT COUNT(*) FROM ?? WHERE discordID = ? AND nodeDate BETWEEN ? AND CURRENT_DATE) AS weeklyAttendance, (SELECT COUNT(*) FROM ?? WHERE discordID = ? AND nodeDate BETWEEN ? AND CURRENT_DATE) AS monthlyAttendance, (SELECT COUNT(*) FROM ?? WHERE discordID = ?) AS lifeAttendance, (SELECT SUM(lootAmount) AS haul FROM ?? WHERE discordID = ? AND lootDate BETWEEN ? AND CURRENT_DATE) AS haul, (SELECT SUM(lootAmount) AS haul FROM ?? WHERE discordID = ?) AS lifeHaul LIMIT 1;";
        var insertStats = [(message.guild.id + "_nodeResults"), queryDateMonth, (message.guild.id + "_nodeAttendance"), userID, queryDateWeek, (message.guild.id + "_nodeAttendance"), userID, queryDateMonth, (message.guild.id + "_nodeAttendance"), userID, (message.guild.id + "_seaLoot"), userID, queryDateWeek, (message.guild.id + "_seaLoot"), userID];
        sql.query(sqlStats, insertStats, function(result){
          if(result[0]){
            //--overall stats
            var statsMonthlyWars = result[0].monthlyWars;
            //--user stats
            var userWeeklyAttendance = result[0].weeklyAttendance;
            var userMonthlyAttendance = result[0].monthlyAttendance;
            var userLifeAttendance = result[0].lifeAttendance;
            var userHaul = 0;
            if(result[0].haul){
              userHaul = result[0].haul;
            }
            var userLifeHaul = 0;
            if(result[0].lifeHaul){
              //Million
              userLifeHaul = result[0].lifeHaul;
              if(result[0].lifeHaul > 1000000){
                userLifeHaul = ((result[0].lifeHaul/1000000).toFixed(3) + "m");
              }
              //billion
              if(result[0].lifeHaul > 1000000000){
                userLifeHaul = ((result[0].lifeHaul/1000000000).toFixed(3) + "b");
              }
            }
            payout.check(message, guilds, function(result){
              //--overall stats
              var statsWeeklyWars = result.nodeWarCount;
              var statsTopHaul = result.topHaul;
              var nodeTiers = result.nodeTiers;
              var seaTiers = result.seaTiers;
              //--user's node tier
              if(guilds[message.guild.id].payoutWeight == "seaMonster"){
                var userNodeTier = 0;
              }
              else{
                var userNodeTier = 1;
                if(statsWeeklyWars > 0){
                  if (Math.round((userWeeklyAttendance / statsWeeklyWars) * nodeTiers) < 1){
                    userNodeTier = 1;
                  }
                  else{
                    userNodeTier = Math.round((userWeeklyAttendance / statsWeeklyWars) * nodeTiers);
                  }
                }
              }
              //--user's sea tier
              if(guilds[message.guild.id].payoutWeight == "seaMonster"){
                var userSeaTier = 1;
                if (userHaul >= 1){
                  if(Math.round((userHaul / statsTopHaul) * seaTiers) < 1){
                    userSeaTier = 1;
                  }
                  else{
                    userSeaTier = Math.round((userHaul / statsTopHaul) * seaTiers);
                  }
                }
              }
              else{
                var userSeaTier = 0;
                if (userHaul >= 1){
                  userSeaTier = Math.round((userHaul / statsTopHaul) * seaTiers);
                }
              }
              //--String for embed
              var payTier = ("Tier " + (userNodeTier + userSeaTier));
              //--if user stats have been updated
              if(userAP){
                  //--if user has awakened stats
                  if(userAAP >= 1){
                    var userRenown = Math.round(((userAP + userAAP)/2)+userDP);
                  }
                  else{
                    var userRenown = (userAP + userDP);
                  }
                  //--get AP scale bonus
                  var scaleAP = renown.scaleAP(userAP);
                  //--get scale AAP bonus
                  var scaleAAP = renown.scaleAP(userAAP);
                  //--get scale DR bonus
                  var scaleDR = renown.scaleDR(userDP);
                  //--get class icon
                  var userClassIcon = renown.renownClassIcon(userClass);
                  //--create sea haul strings
                  var userWeeklyHaulString = " ";
                  if (userHaul > 1){
                    var userWeeklyHaulString = " | Sea Haul: " + userHaul.toLocaleString();
                  }
                  //--create embed
                  embed = new Discord.RichEmbed()
                    .setAuthor(userFamilyName + " | " + userClass, userClassIcon)
                    .setTitle(payTier + userWeeklyHaulString)
                    .setDescription(userWeeklyAttendance + " of " + statsWeeklyWars + " wars this week | " + userMonthlyAttendance + " of " + statsMonthlyWars + " wars in the past 30 days")
                    .setColor(0x00247d)
                    .addField("AP", userAP, true)
                    .addField("AAP", userAAP, true)
                    .addField("DP", userDP, true)
                    .addField("AP Scale Bonus", "+" + scaleAP, true)
                    .addField("AAP Scale Bonus", "+" + scaleAAP, true)
                    .addField("DR Scale Bonus", "+" + scaleDR + "%", true)
                    .addField("Gear Score", userRenown, true)
                    .addField("Total Wars Attended", userLifeAttendance, true)
                    .addField("Total Sea Haul", userLifeHaul, true)
                    .setFooter("Stats updated: " + userUpdateTime + userDiscordCreated)
                  message.channel.send({embed});
                }
                //--verified, but no stats
                else{
                  embed = new Discord.RichEmbed()
                   .setAuthor(userFamilyName + " | UNKNOWN", "https://i.imgur.com/UmhMghb.png")
                   .setTitle("HAS NOT UPDATED STATS | " + payTier)
                   .setDescription(userWeeklyAttendance + " of " + statsWeeklyWars + " wars this week | " + userMonthlyAttendance + " of " + statsMonthlyWars + " wars in the past 30 days")
                   .setColor(0x00247d)
                   .setFooter(userDiscordCreated)
                   message.channel.send({embed});
                 }
            });
          }
        });
      }
      //--no family name found
      else{
        message.channel.send(lang.checkError[2].replace("{USERNAME}", statUsername).replace("{DISCORDCREATED}", userDiscordCreated));
      }
    });
  }
  //--no parameters
  else{
    message.channel.send(lang.checkError[3]);
  }
}

//Guild check
function guild(message, guilds, Discord){
  //--get guild member list
  let guildList = message.guild.members.array();
  guildList = guildList.filter(function(obj){
    return obj._roles.includes(guilds[message.guild.id].roleMember);
  });
  //Get online members
  var onlineList = guildList.filter(function( obj ) {
    return obj.presence.status != "offline";
  });
  var fullGuildList = guildList.map(result => result.user.id);
  var fullOnlineList = onlineList.map(result => result.user.id);
  //if no members
  if(fullGuildList.length < 1){
    message.channel.send(lang.checkError[0]);
    return;
  }
  //if nobody is online
  if(fullOnlineList.length < 1){
    message.channel.send(lang.checkError[4]);
    return;
  }
  //Get guild stats
  var sqlGuildStats = "SELECT (SELECT AVG(((statsAP+StatsAAP)/2)+statsDP) FROM userInfo WHERE discordID IN (?)) AS averageGS, (SELECT AVG(((statsAP+StatsAAP)/2)+statsDP) FROM userInfo WHERE discordID IN (?)) AS onlineGS, (SELECT SUM(((statsAP+StatsAAP)/2)+statsDP) AS gearScore FROM userInfo WHERE discordID IN (?) GROUP BY discordID ORDER BY gearScore DESC LIMIT 1) AS highGS, (SELECT familyName AS gearScore FROM userInfo WHERE discordID IN (?) GROUP BY discordID ORDER BY SUM(((statsAP+StatsAAP)/2)+statsDP) DESC LIMIT 1) AS highGSName, (SELECT COUNT(*) FROM ??) AS totalWars, (SELECT COUNT(*) FROM ?? WHERE nodeResult = 'win') AS totalWins, (SELECT AVG(nodeMembers) FROM ??) AS averageAttendance, (SELECT SUM(lootAmount) FROM ??) AS totalLoot;";
  var insertGuildStats = [fullGuildList, fullOnlineList, fullGuildList, fullGuildList, (message.guild.id + "_nodeResults"), (message.guild.id + "_nodeResults"), (message.guild.id + "_nodeResults"), (message.guild.id + "_seaLoot")];
  sql.query(sqlGuildStats, insertGuildStats, function(result){
    if(result && result[0]){
      var averageGS = result[0].averageGS;
      var onlineGS = result[0].onlineGS;
      var highGS = result[0].highGS;
      var highGSName = result[0].highGSName;
      var totalWars = result[0].totalWars;
      var totalWins = result[0].totalWins;
      var averageAttendance = result[0].averageAttendance;
      var totalLoot = result[0].totalLoot;
      var totalLootSh = totalLoot;
      if(!totalLoot){
        totalloot = 0;
        totalLootSh = 0;
      }
      //Million
      if(totalLoot > 1000000){
        totalLootSh = ((totalLoot/1000000).toFixed(3) + "m");
      }
      //billion
      if(totalLoot > 1000000000){
        totalLootSh = ((totalLoot/1000000000).toFixed(3) + "b");
      }
      //grab Node War wins
      var sqlNodeWins = "SELECT nodeTier, nodeRegion FROM ?? WHERE nodeResult = 'win';";
      sql.query(sqlNodeWins, (message.guild.id + "_nodeResults"), function(result){
        if(result && result[0]){
          var nodeIncome = 0;
          for (var i = 0; i < result.length; i++){
            if(result[i].nodeTier == 5){
              nodeIncome += tax[result[i].nodeRegion];
            }
            else{
              nodeIncome += tax.tier[result[i].nodeTier];
            }
          }
          var nodeIncomeSh = nodeIncome;
          if(nodeIncome > 1000000){
            nodeIncomeSh = ((nodeIncome/1000000).toFixed(3) + "m");
          }
          //billion
          if(nodeIncome > 1000000000){
            nodeIncomeSh = ((nodeIncome/1000000000).toFixed(3) + "b");
          }
          var totalIncome = (totalLoot + nodeIncome);
          var totalIncomeSh = totalIncome
          if(totalIncome > 1000000){
            totalIncomeSh = ((totalIncome/1000000).toFixed(3) + "m");
          }
          //billion
          if(totalIncome > 1000000000){
            totalIncomeSh = ((totalIncome/1000000000).toFixed(3) + "b");
          }
        }
        //No Node War data found
        else{
          var nodeIncome = 0;
          var nodeIncomeSh = 0;
          var totalIncome = totalLoot;
          var totalIncomeSh = totalIncome
          if(totalIncome > 1000000){
            totalIncomeSh = ((totalIncome/1000000).toFixed(3) + "m");
          }
          //billion
          if(totalIncome > 1000000000){
            totalIncomeSh = ((totalIncome/1000000000).toFixed(3) + "b");
          }
        }
        //Create and send embed
        embed = new Discord.RichEmbed()
          .setAuthor("BDO botNET", "https://i.imgur.com/UmhMghb.png")
          .setTitle("Viewing information for " + guilds[message.guild.id].guildName)
          .setDescription(fullOnlineList.length + " of " + fullGuildList.length + " members are online")
          .setColor(0x00247d)
          .addField("Average Gear Score", Math.round(averageGS), true)
          .addField("Online Gear Score", Math.round(onlineGS), true)
          .addField("Highest Gear Score", highGSName + " (" + Math.round(highGS) + ")", true)
          .addField("Total Node Wars", totalWars, true)
          .addField("Win Percentage", Math.round(((totalWins/totalWars)*100)) + "%", true)
          .addField("Average Turnout", Math.round(averageAttendance), true)
          .addField("Node Income", nodeIncomeSh, true)
          .addField("Sea Income", totalLootSh, true)
          .addField("Total Income", totalIncomeSh, true)
          .setFooter("BDO botNET is developed and maintained by Windalgo#5426")

        message.channel.send({embed});
      });
    }
    else{
      message.channel.send(lang.checkError[5])
    }
  });
}

module.exports = {
  player: player,
  guild: guild,
};
