const fs = require('fs');

const lang = require("./language.json");
const enchant = require("./enchant.json");
const cred = require("../cred.json");

var request = require('request');
var request =request.defaults({
    headers: {
		'Host': cred.market.host,
		'User-Agent': cred.market.agent,
		'Content-Type': cred.market.content,
		'Cookie': cred.market.cookie
	}
});


function search(message, parameters, filterAuthor, Discord){
  if(parameters){
    var searchString = parameters.split(" ").join("+");
    request({
      method: "POST",
      uri: cred.market.searchURI,
      body: cred.market.searchBody.replace("{SEARCHTEXT}", searchString)
    },
    (err, response, body) => {
        if (err){
          console.log(err);
          return;
        }
        if(body.substring(0, 6) == "<html>"){
          message.channel.send(lang.market[7]);
          return;
        }
        var searchItem = JSON.parse(body);
        //if items are found
        if(searchItem.list[0]){
          //1 item found
          if(searchItem.list.length == 1){
            var mainKey = searchItem.list[0].mainKey;
            itemCheck(message, mainKey, filterAuthor, Discord)
          }
          //list found
          else{
            //BUILD LIST
            var resultString = "**`key | Item Name`**\n";
            for(var i = 0; i < searchItem.list.length && i < 9; i++){
              resultString += "`[" + (i+1) + "] | " + searchItem.list[i].name + "`\n";
            }
            //if multiple pages
            if(searchItem.list.length > 9){
              resultString += lang.marketFooter[3];
            }
            resultString += lang.marketFooter[0];
            var page = 1;
            //send message
            embed = new Discord.RichEmbed()
             .setAuthor("Search Results", "https://i.imgur.com/UmhMghb.png")
             .setTitle("Page " + page + " of " + Math.ceil(searchItem.list.length/9) + " results")
             .setDescription(resultString)
             .setFooter(lang.marketFooter[1])
             .setColor(0x00247d)

            message.channel.send({embed})
              .then(message => searchResults(message, searchItem, page, filterAuthor, Discord));
          }
        }
        else{
          message.channel.send(lang.market[1]);
        }
      });
  }
  else{
    message.channel.send(lang.market[0]);
  }
}

function searchResults(message, searchItem, page, filterAuthor, Discord){
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      //ITEM SELECTION
      if(isFinite(collected.first().content) && collected.first().content > 0 && searchItem.list[((page-1)*9)+(collected.first().content-1)]) {
        var mainKey = searchItem.list[((page-1)*9)+(collected.first().content-1)].mainKey;
        itemCheck(message, mainKey, filterAuthor, Discord);
      }
      //PREVIOUS PAGE
      else if(collected.first().content == "<" && page > 1){
        page--;
        var resultString = "**`key | Item Name`**\n";
        for(var i = (0 + ((page-1)*9)); i < searchItem.list.length && i < ((page)*9); i++){
          resultString += "`[" + (i+1-((page-1)*9)) + "] | " + searchItem.list[i].name + "`\n";
        }
        //if multiple pages
        if(searchItem.list.length > 9){
          if(page > 1){
            //<
            resultString += lang.marketFooter[2];
          }
          if(page < Math.ceil(searchItem.list.length/9)){
            //>
            resultString += lang.marketFooter[3];
          }
        }
        resultString += lang.marketFooter[0];
        //send message
        embed = new Discord.RichEmbed()
         .setAuthor("Search Results", "https://i.imgur.com/UmhMghb.png")
         .setTitle("Page " + page + " of " + Math.ceil(searchItem.list.length/9) + " results")
         .setDescription(resultString)
         .setFooter(lang.marketFooter[1])
         .setColor(0x00247d)

        message.channel.send({embed})
          .then(message => searchResults(message, searchItem, page, filterAuthor, Discord));
      }
      //NEXT PAGE
      else if(collected.first().content == ">" && (page < Math.ceil(searchItem.list.length/9))){
        page++;
        var resultString = "**`key | Item Name`**\n";
        for(var i = (0 + ((page-1)*9)); i < searchItem.list.length && i < ((page)*9); i++){
          resultString += "`[" + (i+1-((page-1)*9)) + "] | " + searchItem.list[i].name + "`\n";
        }
        //if multiple pages
        if(searchItem.list.length > 9){
          if(page > 1){
            //<
            resultString += lang.marketFooter[2];
          }
          if(page < Math.ceil(searchItem.list.length/9)){
            //>
            resultString += lang.marketFooter[3];
          }
        }
        resultString += lang.marketFooter[0];
        //send message
        embed = new Discord.RichEmbed()
         .setAuthor("Search Results", "https://i.imgur.com/UmhMghb.png")
         .setTitle("Page " + page + " of " + Math.ceil(searchItem.list.length/9) + " results")
         .setDescription(resultString)
         .setFooter(lang.marketFooter[1])
         .setColor(0x00247d)

        message.channel.send({embed})
          .then(message => searchResults(message, searchItem, page, filterAuthor, Discord));
      }
      //0 or otherwise
      else{
        message.channel.send(lang.market[2]);
      }
      message.delete();
      collected.first().delete();
    })
    //if the wait times out (or otherwise errors)
    .catch(x => error(message, 2));
}

function itemCheck(message, mainKey, filterAuthor, Discord){
  request({
    method: "POST",
    uri: cred.market.marketURI,
    body: cred.market.marketBody.replace("{MAINKEY}", mainKey)
  },
  (err, response, body) => {
    if (err){
      console.log(err);
      return;
    }
    if(body.substring(0, 6) == "<html>"){
      message.channel.send(lang.market[7]);
      return;
    }
    var marketItem = JSON.parse(body);
    var len = marketItem.detailList.length;
    //Weapons, Gear, Accessories, and Lifeskill Clothes
    if(marketItem.detailList[len-1].chooseKey == 5 || marketItem.detailList[len-1].chooseKey == 20){
      message.channel.send(lang.market[3].replace("{ITEMNAME}", marketItem.detailList[0].name))
        .then(message => itemPrompt(message, marketItem, filterAuthor, Discord));
    }
    //Ect Items
    else{
      message.channel.send(lang.market[6].replace("{ITEMNAME}", marketItem.detailList[0].name))
        .then(message => itemPrompt(message, marketItem, filterAuthor, Discord));
    }
  });
}

function itemPrompt(message, marketItem, filterAuthor, Discord){
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      //Market Watch
      var len = marketItem.detailList.length;
      if(collected.first().content == "1"){
        //Check if user already has too many items
        var watchListJSON = fs.readFileSync("./watchList.json");
        var watchList = JSON.parse(watchListJSON);
        var userID = collected.first().author.id;
        let hit = 0;
        //Find all hits for user
        for(item in watchList){
          for(grade in watchList[item]){
            if(watchList[item][grade].threshold[userID]){
              hit++
            }
            if(watchList[item][grade].priceJump[userID]){
              hit++
            }
            if(watchList[item][grade].priceDrop[userID]){
              hit++
            }
            if(watchList[item][grade].flood[userID]){
              hit++
            }
            if(watchList[item][grade].sold.users[userID]){
              hit++
            }
          }
        }
        //If the user has more than the maximum allowed items being watched
        if(hit >= cred.maxWatch){
          message.channel.send(lang.marketWatch[6]);
          message.delete();
          collected.first().delete();
          return;
        }

        //If able to add new entry
        //Create tier name arrays for Enchant level prompt
        //Weapons, Gear, Accessories, and Lifeskill Clothes
        if(marketItem.detailList[len-1].chooseKey == 5 || marketItem.detailList[len-1].chooseKey == 10 || marketItem.detailList[len-1].chooseKey == 20){
          //Base - Pen (Accessories, Lifeskill Clothes)
          if(marketItem.detailList[len-1].chooseKey == 5){
            //Accessories
            if(marketItem.detailList[0].mainCategory == 20){
              var tierNames = ["Base", "PRI", "DUO", "TRI", "TET", "PEN"];
            }
            //Lifeskill Clothes
            else if(marketItem.detailList[0].mainCategory == 15){
              var tierNames = ["+0", "+1", "+2", "+3", "+4", "+5"];
            }
          }
          //+0 - +10 (Horse Gear, Wagon Gear, Ship Gear, Matchlocks, Fishing Rods)
          else if (marketItem.detailList[len-1].chooseKey == 10){
            var tierNames = ["+0", "+6", "+7", "+8", "+9", "+10"];
          }
          //+0 - PEN (Weapons, Armor, Manos tools)
          else if(marketItem.detailList[len-1].chooseKey == 20){
            var tierNames = ["Base", "PRI", "DUO", "TRI", "TET", "PEN"];
          }
          //Enchant Prompt
          message.channel.send(lang.marketWatch[0].replace("{1}", tierNames[0]).replace("{1}", tierNames[0]).replace("{2}", tierNames[1]).replace("{3}", tierNames[2]).replace("{4}", tierNames[3]).replace("{5}", tierNames[4]).replace("{6}", tierNames[5]))
            .then(message => enchantLevel(message, marketItem, filterAuthor, Discord));
        }
        //Etc Items
        else{
          message.channel.send(lang.marketWatch[1])
            .then(message => marketWatch(message, marketItem, filterAuthor, [0, 0], Discord));
        }
      }
      //Market Info
      else if (collected.first().content == "2"){
        marketInfo(message, marketItem, Discord);
      }
      //Enchant Info (if available)
      else if (collected.first().content == "3" && (marketItem.detailList[len-1].chooseKey == 5 || marketItem.detailList[len-1].chooseKey == 20)){
        message.channel.send(lang.market[4])
          .then(message => enchantPrompt(message, marketItem, filterAuthor, Discord));
      }
      //0 or otherwise
      else{
        message.channel.send(lang.market[2]);
      }
      message.delete();
      collected.first().delete();
    })
    //if the wait times out (or otherwise errors)
    .catch(x => error(message, 2));
}

function enchantLevel(message, marketItem, filterAuthor, Discord){
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      //Enchant level
      if(["1", "2", "3", "4", "5", "6"].includes(collected.first().content)){
        if(collected.first().content == "1"){
          var enchant = [0, 0];
        }
        //Get the proper key for the enchant level
        else{
          var enchant = [(marketItem.detailList.length - (7 - collected.first().content)), marketItem.detailList[(marketItem.detailList.length - (7 - collected.first().content))].subKey];
        }
        message.channel.send(lang.marketWatch[1])
          .then(message => marketWatch(message, marketItem, filterAuthor, enchant, Discord));
      }
      //0 or otherwise
      else{
        message.channel.send(lang.market[2]);
      }
      message.delete();
      collected.first().delete();
    })
    //if the wait times out (or otherwise errors)
    .catch(x => error(message, 2));
}

function marketWatch(message, marketItem, filterAuthor, enchant, Discord){
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      //Options that need Above/Below prompt
      if(["1", "4"].includes(collected.first().content)){
        switch(collected.first().content){
          case "1":
            var mode = "threshold";
            break;

          case "4":
            var mode = "flood";
            break;
        }
        message.channel.send(lang.marketWatch[2])
          .then(message => aboveBelow(message, marketItem, filterAuthor, enchant, mode, Discord));
      }
      //Skip stright to threshold
      else if(["3", "5"].includes(collected.first().content)){
        switch(collected.first().content){
          case "3":
            var mode = "priceDrop";
            break;

          case "5":
            var mode = "sold";
            break;
        }
        message.channel.send(lang.marketWatch[3])
          .then(message => marketWatchThreshold(message, marketItem, filterAuthor, enchant, mode, null, Discord));
      }
      //Price Jump
      else if(collected.first().content == "2"){
        //finalize
        var mode = "priceJump";
        marketWatchFinalize(collected.first(), marketItem, enchant, mode, null, null, Discord)
      }
      //0 or otherwise
      else{
        message.channel.send(lang.market[2]);
      }
      message.delete();
      collected.first().delete();
    })
    //if the wait times out (or otherwise errors)
    .catch(x => error(message, 2));
}

function aboveBelow(message, marketItem, filterAuthor, enchant, mode, Discord){
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      //Above
      if(collected.first().content == "1"){
        message.channel.send(lang.marketWatch[3])
          .then(message => marketWatchThreshold(message, marketItem, filterAuthor, enchant, mode, "above", Discord));
      }
      //Below
      else if (collected.first().content == "2"){
        message.channel.send(lang.marketWatch[3])
          .then(message => marketWatchThreshold(message, marketItem, filterAuthor, enchant, mode, "below", Discord));
      }
      //0 or otherwise
      else{
        message.channel.send(lang.market[2]);
      }
      message.delete();
      collected.first().delete();
    })
    //if the wait times out (or otherwise errors)
    .catch(x => error(message, 2));
}

function marketWatchThreshold(message, marketItem, filterAuthor, enchant, mode, aboveBelow, Discord){
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      //If input is a number
      let threshold = collected.first().content.replace(/,\s?/g, "");
      if(isFinite(threshold) && threshold > 0 && threshold < 99999999999){
        //Finalize
        marketWatchFinalize(collected.first(), marketItem, enchant, mode, aboveBelow, threshold, Discord)
      }
      //Invalid
      else{
        message.channel.send(lang.marketWatch[5]);
      }
      message.delete();
      collected.first().delete();
    })
    //if the wait times out (or otherwise errors)
    .catch(x => error(message, 2));
}

function marketWatchFinalize(message, marketItem, enchant, mode, aboveBelow, threshold, Discord){
  //load watchlist json
  var watchListJSON = fs.readFileSync("./watchList.json");
  var watchList = JSON.parse(watchListJSON);
  //Check if item is already in the watch list
  if(!watchList[marketItem.detailList[0].mainKey]){
    watchList[marketItem.detailList[0].mainKey] = {};
  }
  //If the enchant level needs to be added to the json
  if(!watchList[marketItem.detailList[0].mainKey][enchant[1]]){
    //establish a blank template
    var len = marketItem.detailList.length;
    //Generate tier name arrays for specific item name
    //Base - Pen (Accessories, Lifeskill Clothes)
    var tierNames = [""];
    if(marketItem.detailList[len-1].chooseKey == 5){
      //Accessories
      if(marketItem.detailList[0].mainCategory == 20){
        tierNames = ["", "PRI: ", "DUO: ", "TRI: ", "TET: ", "PEN: "];
      }
      //Lifeskill Clothes
      else if(marketItem.detailList[0].mainCategory == 15){
        tierNames = ["", "+1 ", "+2 ", "+3 ", "+4 ", "+5 "];
      }
    }
    //+0 - +10 (Horse Gear, Wagon Gear, Ship Gear, Matchlocks, Fishing Rods)
    else if (marketItem.detailList[len-1].chooseKey == 10){
      tierNames = ["", "+6 ", "+7 ", "+8 ", "+9 ", "+10 "];
    }
    //+0 - PEN (Weapons, Armor, Manos tools)
    else if(marketItem.detailList[len-1].chooseKey == 20){
      tierNames = ["", "PRI: ", "DUO: ", "TRI: ", "TET: ", "PEN: "];
    }
    //Get proper index for enchant level
    if(enchant[0] == "0"){
      var enchantIndex = 0;
    }
    else{
      var enchantIndex = (5-((len-1)-enchant[0]));
    }
    watchList[marketItem.detailList[0].mainKey][enchant[1]] = {name: (tierNames[enchantIndex] + marketItem.detailList[0].name), subKey: enchant[0], threshold:{}, priceJump:{}, priceDrop:{}, flood:{}, sold:{users:{}}};
  }
  //add entry based on mode
  switch(mode){
    case "threshold":
      watchList[marketItem.detailList[0].mainKey][enchant[1]][mode][message.author.id] = {"type": aboveBelow, "price": threshold};
    break;

    case "priceJump":
      watchList[marketItem.detailList[0].mainKey][enchant[1]][mode][message.author.id] = {"price": marketItem.detailList[enchant[0]].pricePerOne};
    break;

    case "priceDrop":
      watchList[marketItem.detailList[0].mainKey][enchant[1]][mode][message.author.id] = {"price": threshold};
    break;

    case "flood":
      watchList[marketItem.detailList[0].mainKey][enchant[1]][mode][message.author.id] = {"type": aboveBelow, "amount": threshold};
    break;

    case "sold":
    //Check if sold needs to be updated
      if(!watchList[marketItem.detailList[0].mainKey][enchant[1]][mode].count){
        watchList[marketItem.detailList[0].mainKey][enchant[1]][mode].count = marketItem.detailList[enchant[0]].totalTradeCount;
      }
      let current_datetime = new Date()
      let formatted_date = current_datetime.getFullYear() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getDate()
      watchList[marketItem.detailList[0].mainKey][enchant[1]][mode].users[message.author.id] = {"originalCount": threshold, "count": threshold, "date": formatted_date};
    break;
  }
  //Write information to the json file
  fs.writeFileSync('watchList.json', JSON.stringify(watchList, null, 2));
  message.channel.send(lang.marketWatch[4].replace("{ITEM}", watchList[marketItem.detailList[0].mainKey][enchant[1]].name));
}


function marketInfo(message, marketItem, Discord){
  var len = marketItem.detailList.length;
  //Base - Pen (Accessories, Lifeskill Clothes)
  if(marketItem.detailList[len-1].chooseKey == 5){
    //Accessories
    if(marketItem.detailList[0].mainCategory == 20){
      var tierNames = ["Base", "PRI", "DUO", "TRI", "TET", "PEN"];
    }
    //Lifeskill Clothes
    else if(marketItem.detailList[0].mainCategory == 15){
      var tierNames = ["+0", "+1", "+2", "+3", "+4", "+5"];
    }
  }
  //+0 - +10 (Horse Gear, Wagon Gear, Ship Gear, Matchlocks, Fishing Rods)
  else if (marketItem.detailList[len-1].chooseKey == 10){
    var tierNames = ["+0", "+6", "+7", "+8", "+9", "+10"];
  }
  //+0 - PEN (Weapons, Armor, Manos tools)
  else if(marketItem.detailList[len-1].chooseKey == 20){
    var tierNames = ["Base", "PRI", "DUO", "TRI", "TET", "PEN"];
  }
  //General Items
  else {
    embed = new Discord.RichEmbed()
      .setAuthor(marketItem.detailList[0].name, "https://akamai-webcdn.kgstatic.net/TradeMarket/Common/img/BDO/item/" + marketItem.detailList[0].mainKey +".png")
      .setColor(0x00247d)
      .addField("Total Listed", marketItem.detailList[0].count.toLocaleString(), true)
      .addField("Price", marketItem.detailList[0].pricePerOne.toLocaleString(), true)
    message.channel.send({embed});
    return;
  }
  //Send embed message for enchantable items
  embed = new Discord.RichEmbed()
    .setAuthor(marketItem.detailList[0].name, "https://akamai-webcdn.kgstatic.net/TradeMarket/Common/img/BDO/item/" + marketItem.detailList[0].mainKey +".png")
    .setColor(0x00247d)
    .addField(tierNames[0] + " (" + marketItem.detailList[0].count.toLocaleString() +")", marketItem.detailList[0].pricePerOne.toLocaleString(), true)
    .addField(tierNames[1] + " (" + marketItem.detailList[len-5].count.toLocaleString() +")", marketItem.detailList[len-5].pricePerOne.toLocaleString(), true)
    .addField(tierNames[2] + " (" + marketItem.detailList[len-4].count.toLocaleString() +")", marketItem.detailList[len-4].pricePerOne.toLocaleString(), true)
    .addField(tierNames[3] + " (" + marketItem.detailList[len-3].count.toLocaleString() +")", marketItem.detailList[len-3].pricePerOne.toLocaleString(), true)
    .addField(tierNames[4] + " (" + marketItem.detailList[len-2].count.toLocaleString() +")", marketItem.detailList[len-2].pricePerOne.toLocaleString(), true)
    .addField(tierNames[5] + " (" + marketItem.detailList[len-1].count.toLocaleString() +")", marketItem.detailList[len-1].pricePerOne.toLocaleString(), true)
  message.channel.send({embed});
}

function enchantPrompt(message, marketItem, filterAuthor, Discord){
  message.channel.awaitMessages(filterAuthor, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
      if(!collected.first().content){
        return
      }
      var failStacks = collected.first().content.split(" ");
      //if failstacks are provided
      if(failStacks.length > 0 && failStacks.every(isFinite)){
        enchantInfo(message, marketItem, failStacks, Discord);
      }
      else{
        message.channel.send(lang.market[5]);
      }
      message.delete();
      collected.first().delete();
    })
    //if the wait times out (or otherwise errors)
    .catch(x => error(message, 2));
}

function enchantInfo(message, marketItem, failStacks, Discord){
  var len = marketItem.detailList.length;
  //Base - Pen (Accessories, Lifeskill Clothes)
  if(marketItem.detailList[len-1].chooseKey == 5){
    var type = "smash";
    //Accessories
    if(marketItem.detailList[0].mainCategory == 20){
      var tierNames = ["Base", "PRI", "DUO", "TRI", "TET", "PEN"];
      if(marketItem.detailList[0].grade == 1){
        var grade = "green";
      }
      else{
        var grade = "gold";
      }
    }
    //Lifeskill Clothes
    else if(marketItem.detailList[0].mainCategory == 15){
      var tierNames = ["+0", "+1", "+2", "+3", "+4", "+5"];
      var grade = "lifeskill";
    }
  }
  //+0 - +10 (Horse Gear, Wagon Gear, Ship Gear, Matchlocks, Fishing Rods)
  /*else if (marketItem.detailList[len-1].chooseKey == 10){
    var tierNames = ["+0", "+6", "+7", "+8", "+9", "+10"];
  }*/
  //+0 - PEN (Weapons, Armor, Manos tools)
  else if(marketItem.detailList[len-1].chooseKey == 20){
    var type = "resource";
    var tierNames = ["Base", "PRI", "DUO", "TRI", "TET", "PEN"];
    var grade = "gold";
    //filter gold and orange gear here once enchant rates are figured out
  }
  embed = new Discord.RichEmbed()
    .setAuthor(marketItem.detailList[0].name, "https://akamai-webcdn.kgstatic.net/TradeMarket/Common/img/BDO/item/" + marketItem.detailList[0].mainKey +".png")
    .setColor(0x00247d)

  //Calculate one-step enchants
  for(var i = 0; i < failStacks.length && i < 5; i++){
    if (failStacks[i] > enchant[type][grade][i].softCap){
      var enchantRate = (enchant[type][grade][i].base + (enchant[type][grade][i].baseFail * enchant[type][grade][i].softCap) + (enchant[type][grade][i].softFail * (failStacks[i] - enchant[type][grade][i].softCap)));
    }
    else{
      var enchantRate = (enchant[type][grade][i].base + (enchant[type][grade][i].baseFail * failStacks[i]));
    }
    if(enchantRate > 0.9){
      enchantRate = 0.9;
    }
    //Smashable Items
    if(marketItem.detailList[len-1].chooseKey != 20){
      var enchantPrice = ((marketItem.detailList[0].pricePerOne + marketItem.detailList[i].pricePerOne)*(1/enchantRate));
      embed.addField(tierNames[i] + " => " + tierNames[i+1] + " (" + (enchantRate*100).toLocaleString() + "%)", Math.round(enchantPrice - marketItem.detailList[i+1].pricePerOne).toLocaleString(), true)
    }
    //Non Smashable Items
    else{
      embed.addField(tierNames[i] + " => " + tierNames[i+1], (enchantRate*100).toLocaleString() + "%", true)
    }
  }
  //Calculate full enchants
  //Smashable Items
  if(marketItem.detailList[len-1].chooseKey != 20){
    var cumEnchantRates = [];
    for(var i = 0; i < failStacks.length && i < 5; i++){
      if (failStacks[i] > enchant[type][grade][i].softCap){
        var enchantRate = (enchant[type][grade][i].base + (enchant[type][grade][i].baseFail * enchant[type][grade][i].softCap) + (enchant[type][grade][i].softFail * (failStacks[i] - enchant[type][grade][i].softCap)));
      }
      else{
        var enchantRate = (enchant[type][grade][i].base + (enchant[type][grade][i].baseFail * failStacks[i]));
      }
      if(enchantRate > 0.9){
        enchantRate = 0.9;
      }
      if(i==0){
        cumEnchantRates.push(enchantRate);
      }
      else{
        cumEnchantRates.push((enchantRate * cumEnchantRates[i-1]));
        var enchantPrice = ((marketItem.detailList[0].pricePerOne + (marketItem.detailList[0].pricePerOne*(i+1)))*(1/cumEnchantRates[i]));
        embed.addField(tierNames[0] + " => " + tierNames[i+1] + " (" + (cumEnchantRates[i]*100).toLocaleString() + "%)", Math.round(enchantPrice - marketItem.detailList[i+1].pricePerOne).toLocaleString(), true)
      }
    }
  }
  embed.setFooter(lang.marketFooter[4].replace("{FAILSTRACKS}", failStacks.join(" / ")));
  message.channel.send({embed});
}


function error(message, x){
  //delete previous prompt and send error message
  message.channel.send(lang.optionsError[x]);
  if(x == 2 && !message.deleted){
    message.delete()
  }
}

module.exports = {
  search: search,
};
