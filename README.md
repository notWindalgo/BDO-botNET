# BDO botNET
Black Desert Online Node.js Efficiency Tool

<img align="right" src="https://i.imgur.com/EajAJpu.png" width=10%>

A simple-to-use Discord bot designed with the goal of eliminating Google Sheets from guild management. Automatically take attendance, record sea monster hauls, and generate payout lists without any input required. Also features the ability to generate stat cards, search the market place, calculate enchant rates, and set marketplace alerts for multiple items per user.

[Discord Chat to discuss and test the bot](https://discord.com/invite/VN5XHfg6NJ)

## Setup
[Setup Guide](./SETUP.md)

## Features
Customizable and easy to set up. All the setup required is done within your discord chat, and all information given can be changed at any point.
### Node Wars
 - Set a node war location and tier
 - Automatic reminders will alert your guild when it's time to prepare for war
	- Alerts will only go through if you've confirmed there is a fight for members to show up to
 - After you input the result of your node war, attendance will automatically be taken
	- You can choose to take attendance via members in voice chat or a signup sheet
### Sea Monsters
 - Allow users to self-report sea-monster hauls
	- Users will be required to provide an image to allow auditing
### Payout Sheets
 - Generate a payout tier list with a single command
 - Calculated based on each member's contribution to the total guild income for the week
	- Can be changed to be solely based on node war attendance or sea monster income
### Stat Cards
 - Generate embedded stat cards displaying guild members' stats. Including AP bracket bonuses, node war attendance, and sea monster income
### Market Place functions
 - Search the market place from your discord chat
 - View current prices and listings 
 - Calculate enchant rates
	- Includes average profit/loss for smash-enchant items
 - Set alerts for any item
	- Alert when an item's average price crosses a set threshold
	- Alert when an item's average price changes
	- Alert when an item is listed below a set price
	- Alert when the total amount of listings crosses a set threshold
	- Alert when a set amount of items have sold

## Images
<img align="right" style="float: right;" src="https://i.imgur.com/mYfVkMI.png" height="360" width="240"/>
<img align="left" style="float: left;" src="https://i.imgur.com/0KRV5Fg.png" height="160" width="240"/>
<img align="middle" style="float: center;" src="https://i.imgur.com/4XPd3dJ.png" height="160" width="240"/>
<img align="left" style="float: left;" src="https://i.imgur.com/pQImXil.png" height="160" width="240"/>
<img align="middle" style="float: center;" src="https://i.imgur.com/dKU4R2L.jpg" height="160" width="240"/>

## Usage
| Command | Description
|---------|------------
| `!options` | Provides a list of options to view logs, generate payout lists, and update managment settings
| `!node` | Provides a list of options to set node war locations, update enemy counts, and report the result of node wars
| `!verify` | Updates your family name
| `!stats` | Updates your class (optional) and AP/AAP/DP
| `!loot` | Self-reports profits from a sea monster haul
| `!check` | Check the stats of a guild member
| `!search` | Searches the market for an item (Can be used to set various market alerts, check market prices, and check enchant rates / profits)
| `!list` | View / Edit your current market watch list


## FAQ
### Will you add boss/imperial/igt timers and alerts?
No. I feel the two main functions of botNET (guild management / market monitoring) are necessary, as they don't have any comparable utilities. I have no intention of attempting to create a directionless catch-all, nor do I want to tread ground that is already better covered by the BDO Boss discord bot, the horse trainer discord bot, or SomethingLovely.

### Will this be used to harvest data?
While possible, the data isn't structured in a way that makes spying or harvesting intuitive without a separate method to parse information.
Here is how I see the data if I wish to view it: [Link 1](https://i.imgur.com/fSXkDBN.png) [Link 2](https://i.imgur.com/bw9rkvP.png)

### Is the data I provide the bot safe?
The data is stored in json files and a local DB on my server, much more secure from leaks than a Google Sheets url.

### Why should I trust you / your bot
You don't have to. The bot is open source and you're welcome to set up your own version or lift parts of my code for your own bot/project.