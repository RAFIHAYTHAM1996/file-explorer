import { Fragment, useEffect, useState } from 'react'
import styles from './file-explorer.module.scss'
import Toolbar from '../toolbar/toolbar'

const getKey = (path, index) => index + '-' + path

const FileExplorer = props => {
  const [expandedDirs, setExpandedDirs] = useState(new Map())
  const { contentMap = new Map(), sections = [] } = props

  /**
   * Expands a section and calls watch directory function
   */
  const expandSection = (path, key) => {
    if (path) {
      key = key || path
      
      const map = new Map(expandedDirs)
      map.set(key, true)

      props.watchDir(path)

      setExpandedDirs(map)
    }
  }

  /**
   * Collapses a section and calls unwatch directory function
   */
  const collapseSection = (path, key) => {
    const map = new Map(expandedDirs)
    map.delete(key)
    
    props.unwatchDir(path)
    
    setExpandedDirs(map)
  }

  /**
   * Toggles between expanded and collapsed states for directories
   */
  const toggleSection = (path, key) => {
    if (expandedDirs.get(key)) {
      collapseSection(path, key)
    } else {
      expandSection(path, key)
    }
  }

  /**
   * Collapsed all sections and calls function to unwatch all directories
   */
  const onCollapseAll = () => {
    props.unwatchAllDirs()
    setExpandedDirs(new Map())
  }

  /**
   * Recursively renders file tree
   * 
   * @param {object} entry file/directory to be rendered
   * @param {string} index unique key for React elements
   * @returns Rendered components
   */
  const renderSection = (entry, index) => {
    const key = getKey(entry.path, index),
          isExpanded = expandedDirs.get(key),
          contents = contentMap.get(entry.path) || [],
          btnProps = {
            className: `${styles.entry}`
          };

    if (isExpanded) btnProps.className += ' ' + styles['entry-expanded']
    if (entry.name && entry.name[0] === '.') btnProps.className += ' ' + styles['entry-hidden']
    if (entry.isDirectory) {
      btnProps.onClick = () => toggleSection(entry.path, key)
      btnProps.className += ' ' + styles['entry-clickable']
    }

    return (
      <Fragment key={index}>
        <button {...btnProps}>
          { entry.isDirectory && <span className={styles.chevron}>›</span> }
          {entry.name}
        </button>
        { isExpanded &&
            <ul className={styles['entry-content-list']}>
              { contents.map((subentry, idx) => renderSection(subentry, `${index + 1}-${idx}-${index*idx}`)) }
            </ul>
        }
      </Fragment>
    )
  }

  /**
   * Expands first section on initial load
   */
  useEffect(() => {
    if (sections[0]) {
      expandSection(sections[0].path, getKey(sections[0].path, 0))
    }
  }, [sections])

  return (
    <div className={styles['file-explorer']}>
      <Toolbar onCollapseAll={onCollapseAll} />
      { sections.map(renderSection) }
      { sections.length === 0 && <p className={styles.empty}>No directories provided</p> }
    </div>
  )
}

export default FileExplorer