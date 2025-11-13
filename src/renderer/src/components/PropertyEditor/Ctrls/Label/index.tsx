import { Tooltip } from 'antd'
import style from './index.module.less'
import { useState } from 'react'

interface IProps {
    label?: string
}

const Component: React.FC<IProps & Record<string, any>> = (props): React.JSX.Element => {
    const { label, children } = props;
    return <div className={style.Label}>
        <Tooltip title={label} destroyOnHidden>{label ?? children}</Tooltip>
    </div>
}

export default Component;
