const exec = require('child_process').execFileSync
const { existsSync, readFileSync } = require('fs')
const mime = require('mime-types')

if(process.argv.length > 2) {
    var id = process.argv[2]

    if(existsSync(id)) {
        console.log('Collecting links...')
        var room = JSON.parse(readFileSync(id+'/room.json'))

        var files = []

        function urls() {
            var res = []
            for(f of files) {
                res.push(f.url)
            }
            return res
        }

        for(member of room.members) {
            if(member.avatarUrl && !urls().includes(member.avatarUrl)) {
                files.push({
                    url: member.avatarUrl,
                    ext: 'png',
                    subject: member.userId
                })
            }
        }
        for(msg of room.messages) {
            if(msg.avatarUrl != null && !urls().includes(msg.avatarUrl)) {
                files.push({
                    url: msg.avatarUrl,
                    ext: 'png',
                    subject: msg.userId
                })
            }
            if(msg.url && !urls().includes(msg.url)) {
                var ext = null
                if(msg.mime) {
                    var mimeExt = mime.extension(msg.mime)
                    if(mimeExt)
                        ext = mimeExt
                }
                if(!ext && msg.body.includes('.'))
                    ext = msg.body.substring(msg.body.lastIndexOf('.')+1)
                
                files.push({
                    url: msg.url,
                    ext,
                    subject: msg.userId
                })
            }
        }

        // Download
        var count = 0
        console.log(`Collected ${files.length} URLs, downloading now...`)
        for(file of files) {
            var ext = file.ext ? '.'+file.ext : ''
            var f = file.url.replace(/https\:\/\/matrix\.org\/_matrix\/media\/r0\/download\/.*\//, '')+ext
            try {
                exec('wget', ['-O', id+'/media/'+f, '-q', '-t', '1', '--timeout=60', file.url])
            } catch(err) {
                console.error(`Error downloading ${file.url}, subject: ${file.subject}`)
            }
            count++
            console.log(count+'/'+files.length)
        }
    } else {
        console.log(`No room with the ID ${id} is downloaded in this directory`)
    }
} else {
    console.log('Must provide ID of already downloaded room')
}