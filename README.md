# botbot - block bots and unwanted followers
[Follow me on twitter to watch me dev more dumb stuff](https://twitter.com/valhalla_dev)

## Donations
This extension is free and is 80% open source (backend will be open source soon) and honestly I put a fair bit of work into building it. Donations are not required, will not be begged for but are very much appreciated.

KoFi - https://ko-fi.com/valhalla_dev
ETH - 0xC0552927B2AC2030b417F1Bf34bC9D70883BEd63
XMR - 46gFnNFJ4SjBi9VjBcsygu5UaS4AGSZazVK71GzxxBk2E1MNH34xt5Z5aCLKYSQPNZAxjvTKtyBbeKmHqb4bfS5jNKJEPvV

## Usage 
(requires a Chromium-based browser like Google Chrome and Arc)
To install, pull the repo with Git, or [download the zip](https://github.com/vikingSec/botbot/archive/refs/heads/main.zip).

Now follow these instructions to point your browser at the extension.


### Arc browser
- Go to the [extension management page](arc://extensions/)
- Toggle "Developer mode" in the upper right corner
- Click the "Load unpacked" button in the upper left
- Navigate to the folder you downloaded in the above steps

### Chrome browser
- Go to the [extension management page](chrome://extensions/)
- Toggle "Developer mode" in the upper right corner
- Click the "Load unpacked" button in the upper left
- Navigate to the folder you downloaded in the above steps

## Using the extension
- Navigate to your Followers page ([for ex](https://x.com/valhalla_dev/followers)) on Twitter
- Click the extension 
- (optional) Type the terms you want to block users on, one per line. For example, if you want to block users with #MAGA or #BTC in their bio, you would type "#MAGA", press enter, then type "#BTC" in the terms box.
- (optional) Enter a following:follower ratio to screen on as a minimum. If you enter 40 here, any user with 40x more following than followers will be blocked.
- (optional) Enter usernames you definitely want to exclude from blocking
- Press the Start Cleaning button

## About the project
First and foremost, this extension is buggy. It infinitely* scrolls down your followers list and scrapes usernames off of the web page. It sends these followers to a server (the only information I keep is your username and the users that follow you, which is public information) which enriches that
information with the number of people that follow that user, their bio, their screen name, etc. Then it will block the users by opening up one tab per user to block, clicking the buttons to block them, and keeping the tabs open for you to screen through after it's done.

You are likely going to have to run this extension several times, especially if you have a large number of followers. This is because Twitter will inevitably rate limit the extension. There are ways I could avoid this... but it would only mean making the extension run even slower. On that note, the
extension is very slow. I would open up a new window to run the extension overnight.

I'm not going to be super active in building on this project more, but if you have additions or fixes you want to make, open a PR and I'll check them out. I'm planning on open-sourcing the backend as well as soon as I fix it up

## Paid version (zeusinsight)
There's a user on twitter ([@zeusinsight](https://x.com/zeusinsight)) who runs [XBlockBot](https://xblockbot.com/).

This seems like a solid project, it works way more simply and has a much better UI/UX, and it's only $5 one-time, so if you have the cash, I would go and use his tool first, then run mine to catch what he doesn't.


