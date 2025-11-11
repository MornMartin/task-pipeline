import { Tooltip } from 'antd'
import style from './index.module.less'
import { useState } from 'react'

interface IProps {
    label: string
}

const Component: React.FC<IProps & Record<string, any>> = (props): React.JSX.Element => {
    return <div className={style.Label}><Tooltip title={props.label}>{props.label}</Tooltip></div>
}

export default Component;
