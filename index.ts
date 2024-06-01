import { chromium } from "playwright";
import { expect } from "playwright/test";
import fs from "fs";
import path from "path";

process.env.TEMP = process.env.TEMP || ".";

const PROFILE_FOLDER = `${process.env.TEMP}\playwright-discord-invites`;

enum Mode {
  LOGIN = "login",
  LOGOUT = "logout",
  GENERATE = "generate"
}

const [mode, serverId, channelId, rawNoOfInvites] = <[Mode, ...string[]]>(
  process.argv.slice(2)
);

if (!Object.values(Mode).includes(mode)) {
  throw new Error(`Unknown mode '${mode}'`);
}

if (mode === Mode.GENERATE) {
  if (!serverId) {
    throw new Error("mode 'generate' requires <server-id>");
  }

  if (!channelId) {
    throw new Error("mode 'generate' requires <channel-id>");
  }

  if (!rawNoOfInvites) {
    throw new Error("mode 'generate' requires <number-of-invites>");
  }
}

const headless = !process.env.HEADED && mode === Mode.GENERATE;

if (mode === Mode.LOGIN) {
  const browser = await chromium.launchPersistentContext(PROFILE_FOLDER, {
    headless
  });

  const page = await browser.newPage();
  page.goto("https://discord.com/login");
  browser.addListener("close", () =>
    console.log("Cool, now you should be able to generate links.")
  );
  console.log("Once you've logged into Discord, close the browser.");
} else if (mode === Mode.LOGOUT) {
  fs.rmSync(PROFILE_FOLDER, { recursive: true, force: true });
} else {
  const browser = await chromium.launchPersistentContext(PROFILE_FOLDER, {
    headless
  });

  let noOfInvites = Number.parseInt(rawNoOfInvites);
  const inviteLinks: string[] = [];

  const page = await browser.newPage();

  async function reloadPage() {
    await page.goto(`https://discord.com/channels/${serverId}/${channelId}`);
    await page
      .locator(`a[data-list-item-id="channels___${channelId}"]`)
      .first()
      .getByLabel("Create Invite")
      .click();
  }

  await reloadPage();

  for (const i of Array(noOfInvites).keys()) {
    try {
      await expect(await page.getByLabel("Invite link")).not.toHaveValue(
        "https://discord.gg/"
      );

      const existingInvite = await page.getByLabel("Invite link").inputValue();

      await page.getByRole("button", { name: "Edit invite link" }).click();

      // only need to set the fields on the first open of the edit invite link dialog
      if (i === 1) {
        // assuming the correct dropdown by finding the one that says "7 days"
        await page.getByRole("button", { name: "7 days" }).click();
        await page.getByRole("option", { name: "Never" }).click();

        // assuming the correct dropdown by finding the one that says "No limit"
        await page.getByRole("button", { name: "No limit" }).click();
        await page.getByRole("option", { name: "1 use" }).click();
      }

      await page.route(
        "**/channels/*/invites",
        async (route) => {
          const body = route.request().postDataJSON();
          body.unique = true;
          await route.continue({ postData: body });
        },
        { times: 1 }
      );

      await page.getByRole("button", { name: "Generate a New Link" }).click();

      await expect(await page.getByLabel("Invite link")).not.toHaveValue(
        existingInvite
      );

      await expect(await page.getByLabel("Invite link")).not.toHaveValue(
        "https://discord.gg/"
      );

      const inviteLink = await page.getByLabel("Invite link").inputValue();
      console.log(inviteLink);
      inviteLinks.push(inviteLink);

      // let's not go too fast, or we might get rate limited lol
      await page.waitForTimeout(6000);
    } catch (err) {
      console.log("failed to get a link, continuing");
      console.error(err);
      await reloadPage();
    }
  }
  browser.close();

  if (inviteLinks.length) {
    const inviteLinksCsvFile = path.join(
      fs.mkdtempSync(path.resolve(process.env.TEMP, "invites")),
      "invites.csv"
    );
    fs.writeFileSync(inviteLinksCsvFile, inviteLinks.join("\n"));
    console.log(`dumped links into ${inviteLinksCsvFile}`);
  } else {
    throw new Error("failed to generate any links; something went REAL wrong");
  }
}
