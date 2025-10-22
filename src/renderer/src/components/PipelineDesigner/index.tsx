import style from './index.module.less'
import { createPipeline } from '@renderer/api';

import PipelineInfos from '@renderer/components/PipelineInfos';
import { useNavigate } from 'react-router';

interface IProps { }

const Component: React.FC<IProps & Record<string, any>> = (): React.JSX.Element => {
    const navigate = useNavigate();
    const doAction = async (params) => {
        const id = await createPipeline(params);
        navigate(`/pipelineDesigner/${id}`);
    }
    return <>
        <div className={style.PipelineDesigner}>
            <PipelineInfos doAction={doAction} okBtnLabel='创建'></PipelineInfos>
        </div>
    </>
}

export default Component;
