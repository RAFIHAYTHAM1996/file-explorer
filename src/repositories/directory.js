import axios from "axios";
import URLJoin from 'url-join'
import { ENDPOINTS } from '../config/constants'

/**
 * Fetches content for directories
 * 
 * @param {string|Array} dirPaths one or more paths to desired directories
 * @returns list of directory objects along with their contents
 */
export const fetchDirsContents = async dirPaths => {
    let paths = dirPaths
    if (!(dirPaths instanceof Array)) {
        paths = []
        if (typeof dirPaths === 'string') paths.push(dirPaths)
    }

    try {
        const { data } = await axios.get(URLJoin(ENDPOINTS.DIRECTORY), { params: { paths } });
        return data;
    } catch(e) {
        console.error(e);
        return []
    }
}

/**
 * Calls directory watch API
 * 
 * @param {string|Array} path directory path to watch
 */
export const watch = async path => {
    return axios.post(ENDPOINTS.WATCH_DIRECTORY, { path }).catch(e => {})
}

/**
 * Calls directory unwatch API for one directory
 * 
 * @param {string} path directory path to unwatch
 */
export const unwatch = async path => {
    return axios.put(ENDPOINTS.UNWATCH_DIRECTORY, { path }).catch(e => {})
}

/**
 * Calls directory unwatch API for all directories
 */
export const unwatchAll = async () => {
    return axios.put(ENDPOINTS.UNWATCH_DIRECTORY).catch(e => {})
}

export default {
    fetchDirsContents,
    watch,
    unwatch,
    unwatchAll
}