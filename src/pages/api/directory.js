import path from 'path'
import allSettled from 'promise.allsettled'
import { uniq } from 'lodash'
import FileManager from "../../server/services/file-manager"

/**
 * Retreives directory contents.
 * If path provided is not a directory, it is excluded from the response.
 * 
 * @param {Array} paths one or multiple query parameters representing directories in interest. Defaults to command-line arguments.
 * @returns list of directories with their respective content
 */
export default async (req, res) => {
  let paths = req.query['paths[]']
  
  if (!paths) {
    paths = process.argv.slice(2)
  } else if (typeof paths === 'string') {
    paths = [paths]
  }

  // Resolve paths and remove duplicates
  paths.forEach(p => { p = path.resolve(p) })
  paths = uniq(paths)

  const promises = []
  paths.forEach(p => {
    promises.push(FileManager.readFilesInDirectory(p))
  })
  
  const hierarchies = (await allSettled(promises)).filter(e => e.status === 'fulfilled').map(e => e.value)

  res.status(200).json(hierarchies)
}
