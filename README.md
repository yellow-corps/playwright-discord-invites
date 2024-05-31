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
