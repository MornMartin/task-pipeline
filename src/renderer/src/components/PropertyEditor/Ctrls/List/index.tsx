import style from './index.module.less'
import { useState } from 'react'

interface IProps { }

const Component: React.FC<IProps & Record<string, any>> = (props): React.JSX.Element => {
    const { children } = props;
    return <>
        <div className={style.List}>{children}</div>
    </>
}

export default Component;
