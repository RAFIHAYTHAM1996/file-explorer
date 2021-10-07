import styles from './toolbar.module.scss'
import MinimizeIcon from '../../../public/assets/svg/minimize.svg?include'

const Toolbar = ({ onCollapseAll }) => (
    <div className={styles.toolbar}>
        <button className={`${styles['button']} ${styles['button-minimize']}`}
            onClick={onCollapseAll}
            title='Collapse all'
        >
            <MinimizeIcon />
        </button>
    </div>
)

export default Toolbar