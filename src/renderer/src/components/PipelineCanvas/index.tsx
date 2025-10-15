import { useNavigate } from 'react-router';
import style from './index.module.less'
import { useState } from 'react'

interface IProps { }

const Component: React.FC<IProps & Record<string, any>> = (): React.JSX.Element => {
    const navigate = useNavigate();
    return <>
        <div className={style.PipelineCanvas}>PipelineCanvas</div>
        <div onClick={e => navigate('/pipelineManager')}>Go to PipelineManager</div>
    </>
}

export default Component;
