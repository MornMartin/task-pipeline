import style from './index.module.less';
import PipelineCanvas from '@renderer/components/PipelineCanvas';
import { IActive, INode, mockNodes } from '@renderer/utils/pipelineDeclares';
import { useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router';

interface IProps { }

const Component: React.FC<IProps & Record<string, any>> = (): React.JSX.Element => {
    const { detail } = useLoaderData();
    const [active, setActive] = useState<IActive | null>(null);
    const [nodes, setNodes] = useState<Record<string, INode>>(mockNodes(10));
    // console.log(detail)
    return <>
        <div className={style.PipelineDesigner}>
            <PipelineCanvas nodes={nodes} lines={{}} active={active} onActiveChange={setActive}></PipelineCanvas>
        </div>
    </>
}

export default Component;
