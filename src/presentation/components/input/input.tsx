import React, { memo } from 'react'

import Styles from './input-styles.scss'

type Props = React.ComponentProps<'input'>

const Input: React.FC<Props> = (props: Props) => {
  return (
    <div className={Styles.inputWrap}>
      <input {...props} />
      <span className={Styles.status}>🔴</span>
    </div>
  )
}

export default memo(Input)
