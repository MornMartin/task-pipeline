import style from './index.module.less'
import { useState } from 'react'

interface IProps { }

const Component: React.FC<IProps & Record<string, any>> = (): React.JSX.Element => {
    return <>
        <div className={style.Designer}>Designer</div>
    </>
}

export default Component;
