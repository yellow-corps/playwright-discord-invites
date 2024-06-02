# playwright-discord-invites

Creates discord invites by clicking the generate button a bunch of times using Playwright 👆

## Invites

Generated invites will be one time usage with no expiry.

## Prerequisites

- Git v2 https://git-scm.com/download
- Nodejs v20 https://nodejs.org/en

## How to use

### Setup

Run in a Command Prompt/PowerShell/Git Bash

```
git clone https://<repo>
npm install
```

### Login to Discord

Open the browser...

```
npm run login
```

And then, in the browser window that opened, login to Discord

### Generate Invite Links

Links will be output into the console.

```
npm run generate <server-id> <channel-id> <number-of-invites>
```

### "Logout" of Discord

Clean up the profile folder created in the temp directory

```
npm run logout
```

## Troubleshooting

### Is this safe? Will Discord ban me?

Honestly, not sure. I recommend you make a new Discord account with the "Create Invite Link" permission assigned on the channel you want to create invites for - oh, and give the account at least one friend (see below).

Discord will temporarily ban accounts if they interact with their API too quickly (this will be apparent if you see the words "rate limited" in an error message).

Outside of that, I'm not sure if Discord would permanently ban the account used with this tool. It does depend on them somehow detecting that it's not a human doing the clicking, so mileage may vary.

I did notice in my own testing that the CAPTCHA on login also gets a lot meaner for a bit after running this tool.

### `locator.click` timeout on "Edit invite link"

This occurs because the UI for an invite is different when the account you're using has no friends.

Just add a friend to the account (making sure it's accepted and you can DM the friend), and make sure the friend is not in the server.
