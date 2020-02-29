# SETUP

## Preparing your server
Assuming this bot will mostly be added to existing guild servers, you should already have most the necessary roles and channels set up. No role requires special permissions, they're simply used to check if the user is allowed to use certain bot commands. Likewise, the name doesn't matter, so whatever roles you already have set up can be used.

The roles you will need are:
 - **Guild Master**:	Allows the user to change bot and guild settings
 - **Officer**:			Allows the user to use Node War commands
 - **Member**:			Allows the user to use general commands
 - **Verified**:		No special permissions granted

The channels you will need are:
 - **Announcements**:	Node War notices and reminders will be posted here
 - **Commands**:		The bot will only accept commands from this channel
 
Roles (excluding verified) and channels are both allowed to be shared. For example, the Guild Master and Officer role can be assigned to the same role, or you can have your announcements take place in the same channel you give commands in.

**Roles need to have the "Allow anyone to @mention this role" option enabled during setup. This can be disabled after setup is finished**

## Inviting the bot
Inviting the bot with Administrator permissions is ideal if you don't want to worry about channel permissions. However, it is simple to setup the bot with more restricted permissions if you'd prefer the security.

**Admin invite**: [Invite Link](https://discordapp.com/api/oauth2/authorize?client_id=489963962658455563&permissions=8&scope=bot)

**Non-Admin invite**: [Invite Link](https://discordapp.com/api/oauth2/authorize?client_id=489963962658455563&permissions=402795584&scope=bot)

### Permissions granted:
 - **Send Messages / View Channels**:	Self-explanatory 
 - **Mention Everyone**:				Only used for Node War announcements in the Announcements channel
 - **Add Reactions**:					Used for Node War sign-ups if the option is selected
 - **Manage Messages**:					Used to delete command messages and option messages after a choice is made
 - **Manage Nicknames**:				Used to change the bot's name to match your guild. Used instead of the "Change Nickname" permission due to restrictions
 - **Manage Roles**:					Used to add the verified tag to members after they have provided a family name
 
### Post-Invite
Before you begin the setup process you want to check to make sure:
 - All roles listed above have the "Allow anyone to @mention this role" option enabled
 - The new "botNET" role is ABOVE the verified role you created. If not, the bot will not be able to add the verified tag to users (Not necessary if the bot has admin permissions)
 - Any hidden channels you will be using have permissions set up to allow the bot to read/send/manage messages (Not necessary if the bot has admin permissions)
 
## Setup Command
In any chat you wish to use, initiate setup with the following command:

`!setup`

This will initiate a series of questions in which you will provide @roles and #channels for the bot to associate with your server followed by a series of settings for the bot. Each step is explained during the setup process, but information is as follows:

 - Guild Name
 - Guild Master / Officer / Member / Verified roles
 - Announcements / Commands channels
 - Attendance type (Voice Comms / Sign-up)
	- Node War voice channels (if Voice Comms is selected)
 - Payout weight (Balanced / Node Wars / Sea Monsters)
 
## Success
The bot is now set up, the `!setup` command will no longer work and you will need to use `!options` for any settings you may wish to change.

### Follow Up
After finishing setup, I would suggest the following steps.

**Collecting member information**

Instruct your members to use the following commands

`!verify [family name]`

`!stats [class] [AP] [AAP] [DP]`

Verifying their family names will give them the verified tag on discord and allow their name to appear on the auto-generated payout list. Verifying their stats will allow them to view their stat cards with the `!check` command.

If you want to remind users to update their information, you can find a "Reminder" option in `!options`. This function will PM all users who have not verified their family name or have not updated their stats within 30 days. Be considerate using this, as it can easily annoy your guild members.

**Node Wars**

In order to track attendance and generate attendance-based payout lists you'll need to use the `!node` command to set a node war for the night and log the results following the war

**Market Alerts**

In order to receive updates on prices and listings for market items, you will need to use the `!search` command to search for the item and set alert flags.