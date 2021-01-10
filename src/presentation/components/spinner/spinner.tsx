import React from 'react'

import Styles from './spinner-styles.scss'

type Props = React.ComponentProps<'div'>

const Spinner: React.FC<Props> = ({ className, ...props }: Props) => {
  return (
    <div {...props} className={[Styles.spinner, className].join(' ')}>
      <div />
      <div />
      <div />
      <div />
    </div>
  )
}

export default Spinner
