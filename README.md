# matrix-archiver
Very simple Matrix chat archiver. It does the job, but it's not very clean.

# What It Can Do
This tool can do the following:

 - Download room chat history
 - Download all media in room
 - Save logs as machine parsable JSON
 - Convert logs to HTML

# What It Can't Do
This tool has the following limitations:

 - Cannot download encrypted rooms
 - Cannot save widgets (like Jitsi)

# What You Need
To run, you need NodeJS and NPM (or Yarn). To download media, you need `wget` to be installed and in your path.

If you're running Linux or Mac, wget will probably already be installed. For Windows, it might be installed, but if it's not, you can install it via MinGW or with Chocolatey.

Once you have those, navigate to this program's folder in your terminal (cmd or PowerShell on Windows), and run `npm install` (replace `npm` with `yarn` if you're using Yarn).
That will sort out this program's required dependencies so that you can use it.

# How To Use
## Downloading logs
To download a room's logs, you need a Matrix account in the room you want to download.

Once you're ready, copy `config.json.example` to `config.json` and begin editing it.
You should provide your homeserver's `url`, your `user`name, your `password`, and the `room` that you want to download.

In Element (formerly Riot), you can find a room's internal ID by right-clicking the room, clicking `Settings`, and then clicking `Advanced`.

Once you have finished editing config.json, open your terminal (cmd or PowerShell on Windows) and navigate to this program's folder.
Run `node archiver.js` and it will download the room's logs. **THIS MAY TAKE A VERY LONG TIME**.

Once it has finished, you will see a new folder named the room's ID. In there you will find a file called `room.json`. This file hold's the room's raw chatlogs.

## Downloading media
To download a room's media, you need to have already downloaded the room's logs.

Once you have done that, run `node downloader.js <ROOM ID>`, replacing `<ROOM ID>` with the room's ID.

This will download all of the room's media sequentially.
**THIS MAY TAKE A VERY LONG TIME**, so be patient.

If all goes well, you should have all of the media from the room in a folder called `media` within the room's folder.

## Rendering logs to a webpage
If you want to create a webpage of all the logs that resembles something you would see on a Matrix client instead of just JSON, you can use `render_html.js`.

To use this, you must have downloaded the room's logs. It's also recommended that you have also downloaded the room's media, since otherwise avatars, images, etc will be broken links.

Run `node render_html.js <ROOM ID>`, replacing `<ROOM ID>` with the room's ID.

If all went well, you should see a new file called `room.html` inside of the room's folder.