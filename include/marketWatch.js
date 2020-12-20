const fs = require('fs');

const lang = require("./language.json");
const sql = require("./sql.js");
const cred = require("../cred.json");

var request = require('request');
var request = request.defaults({
    headers: {
		'Host': cred.market.host,
		'User-Agent': cred.market.agent,
		'Content-Type': cred.market.content,
		'Cookie': cred.market.cookie
	}
});

//Initiate Market Watch
function marketWatch(Discord, bot){
  //load watchlist json
  var watchListJSON = fs.readFileSync("./watchList.json");
  var watchList = JSON.parse(watchListJSON);
  //Search sub list by "item" item id and grade
  let t = 0;
  for(item in watchList){
    soldCheck(watchList, item, bot, t);
    t++
  }
}

//Grab General information for the sold check
function soldCheck(watchList, item, bot, t){
  //Delay between searches to stop connection from being refused
  setTimeout(function() {
    request({
      method: "POST",
      uri: cred.market.marketURI,
      body: cred.market.marketBody.replace("{MAINKEY}", item)
    },
    (err, response, body) => {
      if (err){
        console.log(err);
        return;
      }
      if(body.substring(0, 6) == "<html>"){
        return;
      }
      var result = JSON.parse(body);
      var market = result;
      if(!market.detailList){
        return;
      }
      for(grade in watchList[item]){
        search(watchList, item, grade, market, bot);
      }
    });
  }, 250 * t)
}

//Run through specific information
function search(watchList, item, grade, market, bot){
  //load watchlist json for temp replacement
  var tmpWatchListJSON = fs.readFileSync("./watchList.json");
  var tmpWatchList = JSON.parse(tmpWatchListJSON);
  request({
    method: "POST",
    uri: cred.market.itemInfoURI,
    body: cred.market.itemInfoBody.replace("{MAINKEY}", item).replace("{SUBKEY}", grade)
  },
  (err, response, body) => {
    if (err){
      console.log(err);
      return;
    }
    if(body.substring(0, 6) == "<html>"){
      return;
    }
    var result = JSON.parse(body);
    if(!result.marketConditionList){
      return;
    }
    let subKey = watchList[item][grade].subKey;
    //Threshold
    for(user in watchList[item][grade].threshold){
      if((watchList[item][grade].threshold[user].type == "above" && result.basePrice > watchList[item][grade].threshold[user].price) || (watchList[item][grade].threshold[user].type == "below" && result.basePrice < watchList[item][grade].threshold[user].price)){
        //alert user
        bot.fetchUser(user).then(x => {x.send(lang.marketAlert[0].replace("{ITEM}", tmpWatchList[item][grade].name).replace("{PRICE}", Number(result.basePrice).toLocaleString()))});
        //remove user from tmp json
        delete watchList[item][grade].threshold[user];
      }
    }

    //Price Jump
    for(user in watchList[item][grade].priceJump){
      if(watchList[item][grade].priceJump[user].price != result.basePrice){
        //alert user
        bot.fetchUser(user).then(x => {x.send(lang.marketAlert[0].replace("{ITEM}", tmpWatchList[item][grade].name).replace("{PRICE}", Number(result.basePrice).toLocaleString()))});
        //remove user from tmp json
        delete watchList[item][grade].priceJump[user];
      }
    }

    //Listed Price (under)
    for(user in watchList[item][grade].priceDrop){
      var listed = 0;
      for(j = 0; j < result.marketConditionList.length; j++){
        if(result.marketConditionList[j].pricePerOne < watchList[item][grade].priceDrop[user].price && result.marketConditionList[j].sellCount > 0){
          //HIT
          listed += result.marketConditionList[j].sellCount
        }
      }
      if(listed > 0){
        //alert user
        bot.fetchUser(user).then(x => {x.send(lang.marketAlert[2].replace("{LISTED}", Number(listed).toLocaleString()).replace("{ITEM}", tmpWatchList[item][grade].name).replace("{PRICE}", Number(tmpWatchList[item][grade].priceDrop[user].price).toLocaleString()))});
        //remove user from tmp json
        delete watchList[item][grade].priceDrop[user];
      }
    }

    //Sold Alert
    if(watchList[item][grade].sold.count < market.detailList[subKey].totalTradeCount){
      //Update tmp json and check difference
      var difference = (market.detailList[subKey].totalTradeCount - watchList[item][grade].sold.count);
      for(user in watchList[item][grade].sold.users){
        //subtract difference from user count
        var userCount = (watchList[item][grade].sold.users[user].count - difference);
        watchList[item][grade].sold.users[user].count = userCount;
        if(userCount < 1){
          //alert user
          bot.fetchUser(user).then(x => {x.send(lang.marketAlert[3].replace("{AMOUNT}", Number(tmpWatchList[item][grade].sold.users[user].originalCount - userCount).toLocaleString()).replace("{ITEM}", tmpWatchList[item][grade].name).replace("{DATE}", tmpWatchList[item][grade].sold.users[user].date))});
          //remove user from tmp json
          delete watchList[item][grade].sold.users[user];
        }
      }
      watchList[item][grade].sold.count = market.detailList[subKey].totalTradeCount;
    }

    //Flood Alert
    for(user in watchList[item][grade].flood){
      //find listed count
      var listed = 0;
      for(j = 0; j < result.marketConditionList.length; j++){
        listed += result.marketConditionList[j].sellCount;
      }
      if((watchList[item][grade].flood[user].type == "above" && listed > watchList[item][grade].flood[user].amount) || (watchList[item][grade].flood[user].type == "below" && listed < watchList[item][grade].flood[user].amount)){
        //alert user
        bot.fetchUser(user).then(x => {x.send(lang.marketAlert[4].replace("{LISTED}", Number(listed).toLocaleString()).replace("{ITEM}", tmpWatchList[item][grade].name))});
        //remove user from tmp json
        delete watchList[item][grade].flood[user];
      }
    }

    //Delete Grade from json if empty
    let obj = watchList[item][grade];
    if((Object.keys(obj.threshold).length + Object.keys(obj.priceJump).length + Object.keys(obj.priceDrop).length + Object.keys(obj.sold.users).length + Object.keys(obj.flood).length) == 0){
      delete watchList[item][grade];
      //Delete Item from json if empty
      if(Object.keys(watchList[item]).length == 0){
        delete watchList[item];
      }
    }
    //write to json
    fs.writeFileSync('watchList.json', JSON.stringify(watchList, null, 2));
  });
}


//Generate MarketWatch list for user
function list(message, filterAuthor, watchList){
  //Create empty object for hits
  var watchListItems = {threshold: [], priceJump: [], priceDrop: [], flood: [], sold: []};
  var userID = message.author.id;
  //Find all hits for user
  for(item in watchList){
    for(grade in watchList[item]){
      if(watchList[item][grade].threshold[userID]){
        watchListItems.threshold.push({id: item, grade: grade, name: watchList[item][grade].name, type: watchList[item][grade].threshold[userID].type, price: watchList[item][grade].threshold[userID].price});
      }
      if(watchList[item][grade].priceJump[userID]){
        watchListItems.priceJump.push({id: item, grade: grade, name: watchList[item][grade].name});
      }
      if(watchList[item][grade].priceDrop[userID]){
        watchListItems.priceDrop.push({id: item, grade: grade, name: watchList[item][grade].name, price: watchList[item][grade].priceDrop[userID].price});
      }
      if(watchList[item][grade].flood[userID]){
        watchListItems.flood.push({id: item, grade: grade, name: watchList[item][grade].name, type: watchList[item][grade].flood[userID].type, amount: watchList[item][grade].flood[userID].amount});
      }
      if(watchList[item][grade].sold.users[userID]){
        watchListItems.sold.push({id: item, grade: grade, name: watchList[item][grade].name, originalCount: watchList[item][grade].sold.users[userID].originalCount, count: watchList[item][grade].sold.users[userID].count});
      }
    }
  }
  //If the user has no items being watched
  if(watchListItems.threshold.length + watchListItems.priceJump.length + watchListItems.priceDrop.length + watchListItems.flood.length + watchListItems.sold.length == 0){
    message.channel.send(lang.marketWatchList[0]);
    return;
  }
  //Build message and id array
  var watchListMessage = "```yaml\n    Market Watch List\n    # Select the key of the item you wish to remove\n";
  var watchListIndex = [];
  let x = 1;
  //Only build message if array has entries
  if(watchListItems.threshold.length > 0){
    watchListMessage += "Threshold:\n"
    for(i = 0; i < watchListItems.threshold.length; i++){
      watchListMessage += `[${x}] # ${watchListItems.threshold[i].name} | ${(watchListItems.threshold[i].type == "above" ? '>' : '<')} ${Number(watchListItems.threshold[i].price).toLocaleString()}\n`;
      watchListIndex.push([watchListItems.threshold[i].id, watchListItems.threshold[i].grade, "threshold"]);
      x++;
    }
  }
  if(watchListItems.priceJump.length > 0){
    watchListMessage += "Price_Change:\n"
    for(i = 0; i < watchListItems.priceJump.length; i++){
      watchListMessage += `[${x}] # ${watchListItems.priceJump[i].name}\n`;
      watchListIndex.push([watchListItems.priceJump[i].id, watchListItems.priceJump[i].grade, "priceJump"]);
      x++;
    }
  }
  if(watchListItems.priceDrop.length > 0){
    watchListMessage += "Listed_Price:\n"
    for(i = 0; i < watchListItems.priceDrop.length; i++){
      watchListMessage += `[${x}] # ${watchListItems.priceDrop[i].name} | < ${Number(watchListItems.priceDrop[i].price).toLocaleString()}\n`;
      watchListIndex.push([watchListItems.priceDrop[i].id, watchListItems.priceDrop[i].grade, "priceDrop"]);
      x++;
    }
  }
  if(watchListItems.flood.length > 0){
    watchListMessage += "Flood:\n"
    for(i = 0; i < watchListItems.flood.length; i++){
      watchListMessage += `[${x}] # ${watchListItems.flood[i].name} | ${(watchListItems.flood[i].type == "above" ? '>' : '<')} ${Number(watchListItems.flood[i].amount).toLocaleString()}\n`;
      watchListIndex.push([watchListItems.flood[i].id, watchListItems.flood[i].grade, "flood"]);
      x++;
    }
  }
  if(watchListItems.sold.length > 0){
    watchListMessage += "Sold:\n"
    for(i = 0; i < watchListItems.sold.length; i++){
      watchListMessage += `[${x}] # ${watchListItems.sold[i].name} | ${Number(watchListItems.sold[i].originalCount-watchListItems.sold[i].count).toLocaleString()} / ${Number(watchListItems.sold[i].originalCount).toLocaleString()}\n`;
      watchListIndex.push([watchListItems.sold[i].id, watchListItems.sold[i].grade, "sold"]);
      x++;
    }
  }
  //Finish message
  watchListMessage += "\n[0] Cancel\n #  Exit without making changes\n```";
  //Send
  message.channel.send(watchListMessage)
  .then(message => watchListDelete(message, filterAuthor, watchListIndex, userID));
}

function watchListDelete(message, filterAuthor, watchListIndex, userID){
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      //If the user enters a valid number
      if(isFinite(collected.first().content) && collected.first().content > 0 && collected.first().content <= watchListIndex.length){
        //Trim watchListIndex
        watchListIndex = watchListIndex[(collected.first().content - 1)];
        //reload watchlist for accuracy
        var watchListJSON = fs.readFileSync("./watchList.json");
        var watchList = JSON.parse(watchListJSON);
        //remove item selected
        if(watchListIndex[2] == "sold"){
          delete watchList[watchListIndex[0]][watchListIndex[1]][watchListIndex[2]].users[userID];
        }
        else{
          delete watchList[watchListIndex[0]][watchListIndex[1]][watchListIndex[2]][userID];
        }
        //Clean up json if objects are empty
        let obj = watchList[watchListIndex[0]][watchListIndex[1]];
        if((Object.keys(obj.threshold).length + Object.keys(obj.priceJump).length + Object.keys(obj.priceDrop).length + Object.keys(obj.sold.users).length + Object.keys(obj.flood).length) == 0){
          delete watchList[watchListIndex[0]][watchListIndex[1]];
          //Delete Item from json if empty
          if(Object.keys(watchList[watchListIndex[0]]).length == 0){
            delete watchList[watchListIndex[0]];
          }
        }
        //write to json
        fs.writeFileSync('watchList.json', JSON.stringify(watchList, null, 2));
        //Finish
        message.channel.send(lang.marketWatchList[2]);
      }

      //0 or otherwise
      else{
        message.channel.send(lang.marketWatchList[1]);
      }
      message.delete();
      collected.first().delete();
    })
    //if the wait times out (or otherwise errors)
    .catch(err => {
      message.channel.send(lang.optionsError[2]);
      message.delete();
    });
}

module.exports = {
  marketWatch: marketWatch,
  list: list,
};
