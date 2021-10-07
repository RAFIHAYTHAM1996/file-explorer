const API_BASE_PATH = '/api/'

export const ENDPOINTS = {
    DIRECTORY: API_BASE_PATH + 'directory',
    WATCH_DIRECTORY: API_BASE_PATH + 'directory/watch',
    UNWATCH_DIRECTORY: API_BASE_PATH + 'directory/unwatch',
}

export const FILE_EVENTS = {
    add: 'add',
    unlink: 'unlink',
}

export const DIR_EVENTS = {
    add: 'addDir',
    unlink: 'unlinkDir',
}

export const SOCKET_EVENTS = {
    FILE_ADD: 'file-add',
    FILE_UNLINK: 'file-unlink',
    DIR_ADD: 'dir-add',
    DIR_UNLINK: 'dir-unlink',
}