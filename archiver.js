const config = require('./config.json')
const { createClient, MatrixClient, Room } = require('matrix-js-sdk')
const { writeFileSync, mkdirSync, existsSync } = require('fs')

const client = createClient(config.url)

/**
 * Fetches all rooms
 * @returns {Room[]} All rooms
 */
async function getRooms() {
    return await client.getRooms()
}

/**
 * Main function to wrap async operations
 * @param {MatrixClient} c The client
 */
async function main(c) {
    console.log('Logging in...')
    await c.login('m.login.password', {
        user: config.user,
        password: config.password
    })
    console.log('Logged in with access token '+c.getAccessToken())
    console.log('Starting client...')
    await c.startClient()

    console.log('Preparing...')
    await new Promise((res, rej) => {
        const resolve = res
        c.once('sync', (state, prevState, res) => {
            if(state == 'PREPARED')
                resolve()
        })
    })
    console.log('Started and prepared!')

    var users = c.getUsers()

    console.log('Fetching room...')
    const room = c.getRoom(config.room)

    console.log('Fetching messages from channel '+room.name)
    var token = await c.getSyncStateData().nextSyncToken
    var msgs = []
    while(true) {
        try {
            var end = false
            console.log("Fetching...")
            const res = await new Promise(async (res, rej) => {
                var time = setTimeout(() => {
                    rej('Took more than 30 seconds')
                }, 30_000)
                var r = await c._createMessagesRequest(room.roomId, token, 100, 'b')
                clearTimeout(time)
                res(r)
            })

            token = res.end

            for(e of res.chunk) {
                if(e.type == 'm.room.create') {
                    end = true
                    break
                } else {
                    msgs.push(e)
                }
            }
    
            if(msgs.length < 1)
                break
            
            console.log(msgs.length)
    
            if(end)
                break
        } catch(err) {
            console.error('Error while fetching messages: '+err)
            console.log('If timeout, that probably means that the room is finished downloading')
            break
        }
    }

    // Building JSON
    var out = []
    for(msg of msgs) {
        var displayName = msg.user_id.substring(1, msg.user_id.indexOf(':'))
        var avatarUrl = null

        for(user of users) {
            if(user.userId == msg.user_id) {
                displayName = user.displayName
                if(user.avatarUrl) {
                    avatarUrl = c.mxcUrlToHttp(user.avatarUrl)
                }
                break
            }
        }

        var content = msg.content
        if(content.msgtype == 'm.image' || content.msgtype == 'm.video' || content.msgtype == 'm.audio') {
            out.push({
                body: content.body,
                mime: content.info.mimetype,
                size: content.info.size,
                type: content.msgtype,
                url: c.mxcUrlToHttp(content.url),
                timestamp: msg.origin_server_ts,
                userId: msg.user_id,
                displayName,
                avatarUrl
            })
        } else if(content.msgtype == 'm.file') {
            out.push({
                body: content.body,
                size: ('info' in content) ? content.info.size : -1,
                type: content.msgtype,
                url: c.mxcUrlToHttp(content.url),
                timestamp: msg.origin_server_ts,
                userId: msg.user_id,
                displayName,
                avatarUrl
            })
        } else if(content.msgtype == 'm.text') {
            out.push({
                body: content.body,
                type: content.msgtype,
                timestamp: msg.origin_server_ts,
                userId: msg.user_id,
                displayName,
                avatarUrl
            })
        }
    }

    out = out.reverse()

    // write
    console.log('Writing...')
    var id = room.roomId
    if(!existsSync(id)) {
        mkdirSync(id)
    }
    if(!existsSync(id+'/media/')) {
        mkdirSync(id+'/media/')
    }
    var members = []
    var state = room.currentState
    for(member of Object.keys(state.members)) {
        var displayName = msg.user_id.substring(1, msg.user_id.indexOf(':'))
        for(user of users) {
            if(user.userId == member) {
                var displayName = user.displayName
                var avatarUrl = null
                if(user.avatarUrl) {
                    avatarUrl = c.mxcUrlToHttp(user.avatarUrl)
                }
                members.push({
                    userId: member,
                    displayName,
                    avatarUrl
                })
                break
            }
        }
    }
    writeFileSync(id+'/'+'room.json', JSON.stringify({
        id,
        name: room.name,
        members,
        messages: out
    }))

    process.exit()
}

main(client)