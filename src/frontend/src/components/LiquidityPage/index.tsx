import { CSSTransition, SwitchTransition } from 'react-transition-group'
import AddLiquidityPanel from '../../components/AddLiquidityPanel'
import { LiquidityPanel } from '../LiquidityPanel/LiquidityPanel'
// import RemoveLiquidityPanel from "../../components/RemoveLiquidityPanel";
import { useAppSelector } from '../../redux/hooks'
import { selectLiquidity } from '../../redux/reducers/liquidity'
import styles from './index.module.scss'

export default function LiquidityPage() {
  const { panel } = useAppSelector(selectLiquidity)

  return (
    <div className={styles.container}>
      <SwitchTransition>
        <CSSTransition
          key={panel}
          timeout={300}
          classNames={{
            enter: panel === 'main' ? styles.enterMain : styles.enter,
            enterActive: styles.enterActive,
            exit: styles.exit,
            exitActive:
              panel === 'main' ? styles.exitMainActive : styles.exitActive,
          }}
        >
          {panel === 'main' ? (
            <LiquidityPanel />
          ) : panel === 'add' ? (
            <AddLiquidityPanel />
          ) : // : panel === "remove" ?
          //   <RemoveLiquidityPanel/>
          null}
        </CSSTransition>
      </SwitchTransition>
    </div>
  )
}
