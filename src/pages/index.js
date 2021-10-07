import { useEffect, useState, useRef } from 'react'
import { io } from "socket.io-client";
import { remove } from 'lodash/array'
import axios from 'axios';
import styles from '../styles/pages/index.module.scss'
import repository from '../repositories/directory'
import { ENDPOINTS, SOCKET_EVENTS } from '../config/constants'
import FileExplorer from '../components/file-explorer/file-explorer';

const pathParamCheck = path => { if (!path || typeof path !== 'string') throw new Error('Directory path missing') }

const Home = () => {
    const [socket, setSocket] = useState()
    const [sections, setSections] = useState([])
    const [contentMap, setContentMap] = useState(new Map())
    const contentMapRef = useRef(contentMap);

    /**
     * - Initializes socket.io client and disconnect socket on unmount.
     * - Fetches root directories and updates state
     */
    useEffect(() => {
        const s = io()
        
        s.on(SOCKET_EVENTS.FILE_ADD, data => {
            // console.log('FILE ADDED', data.parent, data.path)
            addContentToDir(data.parent, { path: data.path, isDirectory: false })   
        })

        s.on(SOCKET_EVENTS.FILE_UNLINK, data => {
            // console.log('FILE REMOVED', data.parent, data.path)
            removeContentFromDir(data.parent, { path: data.path, isDirectory: false })
        })

        s.on(SOCKET_EVENTS.DIR_ADD, data => {
            // console.log('DIR ADDED', data.parent, data.path)
            addContentToDir(data.parent, { path: data.path, isDirectory: true })
        })

        s.on(SOCKET_EVENTS.DIR_UNLINK, data => {
            // console.log('DIR REMOVED', data.parent, data.path)
            removeContentFromDir(data.parent, { path: data.path, isDirectory: true })
        })

        s.on('connect_error', () => {
            setSocket();
        })
        
        s.on("disconnect", () => {
            setSocket();
            unwatchAllDirs();
        });
        
        setSocket(s)

        repository.fetchDirsContents()
            .then(result => {
                const roots = []
                if (result instanceof Array) {
                    result.forEach(res => {
                    const root = { ...res }
                    roots.push(root)
                    })
                }
                setSections(roots)
            }).catch(e => {})

        return () => {
            if (socket) socket.disconnect()
        }
    }, [])

    /**
     * Sorts root directory content and stores it in content map
     */
    useEffect(() => {
        if (sections.length > 0) {
            const tempContentMap = new Map()
            sections.forEach(section => {
                tempContentMap.set(section.path, sortEntries(section.contents))
                delete section.contents
            })
            setContent(tempContentMap)
        }
    }, [sections])
    
    /**
     * Retrieves directory content and sets a watcher
     * 
     * @param {string} path directory to watch
     */
    const watchDir = (path) => {
        pathParamCheck(path)
        try {
            repository.fetchDirsContents(path)
                .then(results => {
                    if (results[0]) updateDirContents(results[0].path, results[0].contents)
                }).catch(e => {})
            
            repository.watch(path)
        } catch(e) {}
    }

    /**
     * Calls directory unwatch API and frees content map from relevant content
     * 
     * @param {string} path directory to unwatch
     */
    const unwatchDir = (path) => {
        pathParamCheck(path)
        
        repository.unwatch(path)

        // Remove directory contents from cache
        const map = new Map(contentMapRef.current)
        map.delete(path)
        setContent(map)
    }

    /**
     * Calls directory unwatch-all API and resets content map
     */
    const unwatchAllDirs = () => {
        repository.unwatchAll()
        setContentMap(new Map())
    }

    /**
     * Sorts contents based on type (directories first, files second) and name (alphabetically, ascending order).
     * 
     * @param {Array} content list of objects (file/directory) to be sorted
     * @returns {Array} sorted content array
     */
    const sortEntries = content => {
        if (content instanceof Array) {
          const sortAlphabetically = (a, b) => (a < b) ? -1 : (a > b) ? 1 : 0;
          content.sort((a, b) => {
            if (a.isDirectory && b.isDirectory) return sortAlphabetically(a.name, b.name)
            else if (!a.isDirectory && !b.isDirectory) return sortAlphabetically(a.name, b.name)
            else if (a.isDirectory) return -1
            else if (b.isDirectory) return 1
          })
        }
        return content
    }

    const updateDirContents = (path, contents) => {
        const map = new Map(contentMapRef.current)
        map.set(path, sortEntries(contents))
        setContent(map)
    }

    const setContent = map => {
        contentMapRef.current = map
        setContentMap(map)
    }
    
    /**
     * Handles 'add' and 'addDir' events from the file system.
     * Adds the new object to its parent directory's list of contents
     * 
     * @param {string} dir parent directory path
     * @param {object} content new object to be added to directory contents
     */
    const addContentToDir = (dir, content) => {
        if (content.path === dir) return;
        const cached = contentMapRef.current.get(dir)
        const contents = cached ? [...cached] : []
        if (contents && !contents.find(c => c.path === content.path)) {
            contents.push({
                path: content.path,
                name: content.path.substr(content.path.lastIndexOf('/') + 1),
                isDirectory: content.isDirectory
            })
            updateDirContents(dir, contents);
        }
    }
    
    /**
     * Handles 'unlink' and 'unlinkDir' events from the file system.
     * Removes the object from its parent directory's list of contents.
     * If removed object is a directory, all cached contents related to its subdirectories are also removed.
     * 
     * @param {string} dir parent directory path
     * @param {object} content new object to be added to directory contents
     */
    const removeContentFromDir = (dir, content) => {
        contentMapRef.current = removeSubDirsFromContentMap(content) || contentMapRef.current

        const cached = contentMapRef.current.get(dir)
        let contents = cached ? [...cached] : []

        if (contents.length > 0) {
            console.log(contents)
            remove(contents, c => c.path === content.path && c.isDirectory === content.isDirectory)
            console.log(contents)
            updateDirContents(dir, contents);
        }
    }

    /**
     * Recursively removes subdirectories' contents from cache
     * 
     * @param {object} content directory object to be removed along with its subdirectories
     * @returns new content map
     */
    const removeSubDirsFromContentMap = content => {
        if (content.isDirectory) {
            let map = new Map(contentMapRef.current);
            map.get(content.path)?.forEach(c => {
                const tempMap = removeSubDirsFromContentMap(c)
                if (tempMap) map = tempMap
            })
            map.delete(content.path)
            return map
        }
    }

    return (
        <main className={styles.container}>
            <FileExplorer
                watchDir={watchDir}
                unwatchDir={unwatchDir}
                unwatchAllDirs={unwatchAllDirs}
                sections={sections}
                contentMap={contentMap} />
            <div className={styles['sub-container']}>
                <h1 className={styles['app-title']}>File Explorer</h1>
                <h2 className={styles['author']}>by Rafi George</h2>
            </div>
        </main>
    )
}

export default Home