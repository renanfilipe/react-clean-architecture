import React, { memo, useContext } from 'react'

import Context from '@/presentation/contexts/form/form-context'

import Styles from './input-styles.scss'

type Props = React.ComponentProps<'input'>

const Input: React.FC<Props> = (props: Props) => {
  const { errorState } = useContext(Context)
  const error = errorState[props.name]

  const enableInput = (event: React.FocusEvent<HTMLInputElement>): void => {
    event.target.readOnly = false
  }

  const getStatus = (): string => {
    return '🔴'
  }

  const getTitle = (): string => {
    return error
  }

  return (
    <div className={Styles.inputWrap}>
      <input {...props} readOnly onFocus={enableInput} />
      <span
        data-testid={`${props.name}-status`}
        title={getTitle()}
        className={Styles.status}
      >
        {getStatus()}
      </span>
    </div>
  )
}

export default memo(Input)
