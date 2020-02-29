//Require
const fs = require('fs');
const lang = require("./language.json");
const tax = require("./tax.json");

const sql = require("./sql.js");
const date = require("./date.js");

function check(message, guilds, callback){
    //--get dates for queries
    var queryDateWeek = date.week();
    var queryDateMonth = date.month();
    //--get total wars, total haul, and top haul
    var sqlStats = "SELECT (SELECT COUNT(*) FROM ?? WHERE nodeDate BETWEEN ? AND CURRENT_DATE) AS weeklyWars, (SELECT SUM(lootAmount) FROM ?? WHERE lootDate BETWEEN ? AND CURRENT_DATE) AS totalHaul, (SELECT SUM(lootAmount) as haul FROM ?? WHERE lootDate BETWEEN ? AND CURRENT_DATE GROUP BY discordID ORDER BY haul DESC LIMIT 1) AS topHaul LIMIT 1;";
    var insertStats = [(message.guild.id + "_nodeResults"), queryDateWeek, (message.guild.id + "_seaLoot"), queryDateWeek, (message.guild.id + "_seaLoot"), queryDateWeek];
    sql.query(sqlStats, insertStats, function(result){
      var statsWeeklyWars = result[0].weeklyWars;
      var statsTotalHaul = 0;
      var statsTopHaul = 0;
      if (result[0].totalHaul > 0){
        statsTotalHaul = result[0].totalHaul;
      }
      if(result[0].topHaul > 0){
        statsTopHaul = result[0].topHaul;
      }
      //--grab all node war wins for income
      var sqlWeeklyWins = "SELECT nodeTier, nodeRegion FROM ?? WHERE nodeResult = 'win' AND nodeDate BETWEEN ? AND CURRENT_DATE";
      var insertWeeklyWins = [(message.guild.id + "_nodeResults"), queryDateWeek];
      sql.query(sqlWeeklyWins, insertWeeklyWins, function(result){
        var nodeWins = [];
        if(result[0]){
          nodeWins = result;
        }
        //--get guild member list
        let fullGuildList = message.guild.members.array();
        fullGuildList = fullGuildList.filter(function(obj){
          return obj._roles.includes(guilds[message.guild.id].roleMember);
        });
        fullGuildList = fullGuildList.map(result => result.user.id);
        //if no members
        if(fullGuildList.length < 1){
          message.channel.send(lang.payoutError[0]);
          return;
        }
        //--get full attendance list
        var sqlAttendance = "SELECT userInfo.discordID, userInfo.familyName, COUNT(CASE WHEN ??.nodeDate BETWEEN ? AND CURRENT_DATE THEN 1 END) AS cnt, (SELECT SUM(lootAmount) FROM ?? WHERE discordID = userInfo.discordID AND lootDate BETWEEN ? AND CURRENT_DATE GROUP BY discordID) AS loot FROM userInfo LEFT JOIN ?? ON userInfo.discordID = ??.discordID WHERE userInfo.discordID IN (?) GROUP BY discordID ORDER BY familyName;";
        var insertAttendance = [(message.guild.id + "_nodeAttendance"), queryDateWeek, (message.guild.id + "_seaLoot"), queryDateWeek, (message.guild.id + "_nodeAttendance"), (message.guild.id + "_nodeAttendance"), fullGuildList];
        sql.query(sqlAttendance, insertAttendance, function(result){
          if(result){
            //--count total tiers for both node and sea results
            var nodeTiersTotal = 0;
            var seaTiersTotal = 0;
            for (var i = 0, len = result.length; i < len; i++){
              if (result[i].loot >= 1){
                seaTiersTotal += ((result[i].loot / statsTopHaul) * 10);
              }
              if(result[i].cnt > 0 && statsWeeklyWars > 0){
                nodeTiersTotal += ((result[i].cnt / statsWeeklyWars) * 10);
              }
              else{
                nodeTiersTotal += 1;
              }
            }
            //--figure out our total profit from nodes
            var statsWeeklyNode = 0;
            if (nodeWins){
              for (var i = 0, len = nodeWins.length; i < len; i++){
                if(nodeWins[i].nodeTier == 5){
                  statsWeeklyNode += tax[nodeWins[i].nodeRegion];
                }
                else{
                  statsWeeklyNode += tax.tier[nodeWins[i].nodeTier];
                }
              }
            }
            //--find total profit
            var weeklyIncome = (statsWeeklyNode + statsTotalHaul);
            //--divide tiers
            if(guilds[message.guild.id].payoutWeight == "nodeWar"){
              var nodeTiers = 10;
              var seaTiers = 0;
            }
            else if(guilds[message.guild.id].payoutWeight == "seaMonster"){
              var nodeTiers = 0;
              var seaTiers = 10;
            }
            else{
              //--node tiers
              var nodeCut = (statsWeeklyNode / nodeTiersTotal);
              if(Number.isNaN(nodeCut)){
                nodeCut = 0;
              }
              var seaCut = (statsTotalHaul / seaTiersTotal);
              if(Number.isNaN(seaCut)){
                seaCut = 0;
              }
              var nodeTiers = Math.round((nodeCut / (nodeCut + seaCut)) * 10);
              if(isNaN(nodeTiers) || nodeTiers < 1){
                nodeTiers = 1;
              }
              //--sea tiers
              var seaTiers = (10 - nodeTiers);
            }
            //--calculate tiers per player
            var attendanceNames = "";
            var attendancePay = "";
            for (var i = 0, len = result.length; i < len; i++){
              attendanceNames += (result[i].familyName + "\n");
              //--player node tiers
              if(guilds[message.guild.id].payoutWeight == "seaMonster"){
                var playerNodeTier = 0;
              }
              else{
                var playerNodeTier = 1;
                if(result[i].cnt >= 1){
                  if (Math.round((result[i].cnt / statsWeeklyWars) * nodeTiers) < 1){
                    playerNodeTier = 1;
                  }
                  else{
                    playerNodeTier = Math.round((result[i].cnt / statsWeeklyWars) * nodeTiers);
                  }
                }
              }
              //--player sea tiers
              if(guilds[message.guild.id].payoutWeight == "seaMonster"){
                var playerSeaTier = 1;
                if (result[i].loot >= 1){
                  if(Math.round((result[i].loot / statsTopHaul) * seaTiers) < 1){
                    playerSeaTier = 1;
                  }
                  else{
                    playerSeaTier = Math.round((result[i].loot / statsTopHaul) * seaTiers);
                  }
                }
              }
              else{
                var playerSeaTier = 0;
                if (result[i].loot >= 1){
                  playerSeaTier = Math.round((result[i].loot / statsTopHaul) * seaTiers);
                }
              }
              attendancePay += ("Tier " + (playerNodeTier + playerSeaTier) + "\n");
            }

            return callback({
              nodeIncome: statsWeeklyNode,
              seaIncome: statsTotalHaul,
              weeklyIncome: weeklyIncome,
              nodeTiers: nodeTiers,
              seaTiers: seaTiers,
              nodeWarCount: statsWeeklyWars,
              topHaul: statsTopHaul,
              attendanceNames: attendanceNames,
              attendancePay: attendancePay
            });
          }
        });
      });
    });
}

module.exports = {
  check: check,
}
