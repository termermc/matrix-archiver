const { existsSync, readFileSync, writeFileSync, readdirSync } = require('fs')
const ejs = require('ejs')

if(process.argv.length > 2) {
    var id = process.argv[2]

    if(existsSync(id)) {
        var root = id+'/'
        var mediaRoot = id+'/media/'

        console.log('Loading room JSON...')
        var room = JSON.parse(readFileSync(root+'room.json'))
        var members = room.members
        var messages = room.messages

        console.log('Loading media list...')
        var mediaFiles = readdirSync(mediaRoot)

        if(mediaFiles.length < 1)
            console.warn(`No media files found. Either the room has no media, or the room's media was never downloaded.`)

        function mediaUrlToFilename(url) {
            if(url) {
                // Get media ID
                var id = url.substring(url.lastIndexOf('/')+1)

                // Find filename and return it
                for(filename of mediaFiles)
                    if(filename.startsWith(id))
                        return filename
            }

            // If nothing was found, return null
            return null
        }
        function formatTimestamp(timestamp) {
            return new Date(timestamp).toUTCString()
        }

        console.log('Rendering...')

        // Load and render template
        var rendered = ejs.render(readFileSync('template.ejs').toString(), { room, members, messages, mediaUrlToFilename, formatTimestamp })

        // Save rendered room
        writeFileSync(root+'room.html', rendered)

        console.log('Saved as room.html')
    } else {
        console.log(`No room with the ID ${id} is downloaded in this directory`)
    }
} else {
    console.log('Must provide ID of already downloaded room')
}