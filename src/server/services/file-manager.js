import path from 'path'
import { promises as fsp } from 'fs';
import chokidar from 'chokidar';
import allSettled from 'promise.allsettled'
import { FILE_EVENTS, DIR_EVENTS, SOCKET_EVENTS } from '../../config/constants'

const watchedFilesAndDirs = new Map()

/**
 * @param  {string} name name of object
 * @param  {string} path path to object
 * @param  {boolean} isDirectory defaults to false.
 * @param  {Array} contents contents of directory. Defaults to undefined.
 * @return object with above properties
 */

const createResponseObject = (name, path, isDirectory = false, contents) => ({
    name,
    path,
    isDirectory,
    contents: isDirectory ? contents : undefined,
})

class FileManager {
    
    /**
     * Returns a list of content within a directory (1 level deep only)
     * @param  {string} dir path to directory
     * @return {object} contains name, path and contents of directory along with an 'isDirectory' flag.
     */
    static async readFilesInDirectory(dir = '') {
        let contents = [], isDir = false;
        dir = path.resolve(dir)
        try {
            const dirEntries = await fsp.opendir(dir);
            for await (const dirent of dirEntries) {
                contents.push(createResponseObject(dirent.name, path.join(dir, dirent.name), dirent.isDirectory()))
            }
            isDir = true;
        } catch (err) {
            // console.log(err)
            throw new Error(err)
        }
        return createResponseObject(path.basename(dir), dir, isDir, contents)
    }

    /**
     * Watches a directory for add and unlink events on files and directories within it.
     * Nested directories' contents are not watched. Event listeners are stored in an in-memory map
     * 
     * @param  {string} dir path to directory
     * @param  {function} onFSEvent callback function for when an event is captured
     */
    static async watchDir(dir = '', onFSEvent = () => {}) {
        if (typeof dir !== 'string') throw new Error('Directory path must be a string')
        else if (typeof onFSEvent !== 'function') throw new Error('onFSEvent parameter must be of type function')

        dir = path.resolve(dir)

        const existingWatcher = watchedFilesAndDirs.get(dir)
        if (!existingWatcher) {
            const watcher = chokidar.watch(dir, { depth: 0, ignoreInitial: true });
            watcher
                .on(FILE_EVENTS.add, path => { onFSEvent(SOCKET_EVENTS.FILE_ADD, dir, path) })
                .on(FILE_EVENTS.unlink, path => { onFSEvent(SOCKET_EVENTS.FILE_UNLINK, dir, path) })
                .on(DIR_EVENTS.add, path => { onFSEvent(SOCKET_EVENTS.DIR_ADD, dir, path) })
                .on(DIR_EVENTS.unlink, path => { onFSEvent(SOCKET_EVENTS.DIR_UNLINK, dir, path) })
            
            watchedFilesAndDirs.set(dir, watcher)
        }
    }

    /**
     * Finds directory watcher in cache, then closes and removes it from cache.
     * 
     * @param  {string} dir path to directory to unwatch
     */
    static async unwatchDir(dir = '') {
        if (typeof dir !== 'string') throw new Error('Directory path must be a string')

        const existingWatcher = watchedFilesAndDirs.get(dir)
        if (existingWatcher) {
            await existingWatcher.close()
            watchedFilesAndDirs.delete(dir)
        }
    }

    /**
     * Closes all directory watchers and clears cache
     * 
     * @param  {string} dir path to directory to unwatch
     */
    static async unwatchAllDirs() {
        const promises = []
        watchedFilesAndDirs.forEach(watcher => {
            promises.push(watcher.close())
        })
        await allSettled(promises)
        watchedFilesAndDirs.clear();
    }
}

export default FileManager