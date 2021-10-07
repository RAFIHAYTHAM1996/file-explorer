import FileManager from "../../../server/services/file-manager"

/**
 * Triggers directory unwatch. If no parameter is found, all currently watched directories will be unwatched.
 * 
 * @param {string} path optional. directory to be unwatched.
 */
export default async (req, res) => {
    if (req.method === 'PUT') {
        const { path } = req.body
    
        try {
            if (!path) {
                await FileManager.unwatchAllDirs()
            } else {
                await FileManager.unwatchDir(path)
            }
            res.status(200).send()
        } catch(e) {
            res.status(500).send('Unable to unwatch', path)
        }
    }
}