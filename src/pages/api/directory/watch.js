import path from 'path'
import FileManager from "../../../server/services/file-manager"

/**
 * FileSystem event handler. Emits event to socket.io clients
 * 
 * @param {string} event event name
 * @param {string} dir parent directory path
 * @param {string} filePath path to affected file/directory
 */
const onFSEvent = (io) => (event, dir, filePath) => {
    // console.log(`${event} ${filePath} to ${path.basename(dir)}`)
    io.emit(event, { parent: dir, path: filePath });
}

/**
 * Trigger a directory watch
 * 
 * @param {string} path directory to be unwatched.
 */
export default async (req, res) => {
    if (req.method === 'POST') {
        const { path } = req.body
    
        if (!path) {
            res.status(400).send('"path" query parameter must be provided')
            return;
        }

        try {
            await FileManager.watchDir(path, onFSEvent(res?.socket?.server?.io))
            res.status(200).send()
        } catch(e) {
            res.status(500).send('Unable to watch', path)
        }
    }
}