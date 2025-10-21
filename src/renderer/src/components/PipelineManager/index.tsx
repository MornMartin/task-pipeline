import { Button, Flex, Modal, Table, TableColumnsType, TableProps } from 'antd';
import style from './index.module.less'
import { useCallback, useEffect, useMemo, useState } from 'react'
import PipelineList from '@renderer/components/PipelineList';
import { deletePipeline, getPipelines, updatePipelineBasicInfo } from '@renderer/api';
import { debounce } from '@renderer/utils/methods';
import Search from 'antd/es/input/Search';
import { errorMsg } from '@renderer/utils/message';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import PipelineInfos from '@renderer/components/PipelineInfos';
const loadDataDebouncd = debounce(50);

interface IProps { }

interface DataType {
    id: React.Key;
    name: string;
    descriptions: string;
    updated_at: string;
    created_at: string;
}

const Component: React.FC<IProps & Record<string, any>> = (): React.JSX.Element => {
    const navigate = useNavigate();
    const [message, messageContextHolder] = errorMsg();
    const [modal, modalContextHolder] = Modal.useModal();
    const [selectedIds, setSelectedIds] = useState<React.Key[]>([]);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [runLoading, setRunLoading] = useState(false);
    const [dataSource, setDataSource] = useState<DataType[]>([]);
    const [total, setTotal] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [current, setCurrent] = useState(1);
    const [keywords, setKeywords] = useState('');
    const [sorter, setSorter] = useState({ sortField: '', sortOrder: '' });
    const [editing, setEditingId] = useState<DataType>();
    const isShowEditingModal = useMemo(() => !!editing, [editing]);

    const toDelete = async (id?: string) => {
        modal.confirm({
            title: '注意',
            content: '流水线删除后无法恢复，请确认是否继续？',
            icon: <ExclamationCircleFilled />,
            okText: '确定',
            cancelText: '取消',
            async onOk() {
                try {
                    const toDeleteIds = id ? [id] : selectedIds as string[];
                    setDeleteLoading(true);
                    await deletePipeline(toDeleteIds);
                    loadData(keywords, pageSize, current, sorter);
                    setSelectedIds(selectedIds.filter(item => !toDeleteIds.includes(item as string)));
                } catch (err: any) {
                    message(err);
                }
                Modal.destroyAll();
                setDeleteLoading(false);
            },
            onCancel() {
                Modal.destroyAll();
            }
        })
    };

    const toDesing = (id: string) => {
        navigate(`/pipelineDesigner/${id}`)
    }

    const toRun = () => {
        setRunLoading(true);
        //@todo
    }

    const toEdit = (pipeline: DataType) => {
        setEditingId(pipeline);
    }

    const doEdit = async (params) => {
        try {
            await updatePipelineBasicInfo(editing?.id as string, params);
            loadData(keywords, pageSize, current, sorter);
            setEditingId(undefined);
        } catch (err: any) {
            message(err?.message ?? err);
        }
    }

    const loadData = (name, pageSize, current, sorter) => {
        loadDataDebouncd(async () => {
            const res = await getPipelines(name, pageSize, current, sorter);
            const { data, total } = res;
            setTotal(total);
            setDataSource(data);
            if (!data.length) setCurrent(1);
        })
    }

    const onSearch = (e) => {
        setCurrent(1);
        setKeywords(e);
    }

    const onTableChange = (pagination, filters, sorter, extra) => {
        const { current, pageSize } = pagination;
        setCurrent(current);
        setSorter({ sortField: sorter.field, sortOrder: sorter.order === 'ascend' && 'ASC' || 'DESC' })
        setPageSize(pageSize);
    }

    useEffect(() => {
        loadData(keywords, pageSize, current, sorter);
    }, [keywords, current, pageSize, sorter]);

    const hasSelected = selectedIds.length > 0;

    return <>
        {messageContextHolder}
        {modalContextHolder}
        <div className={style.PipelineManager}>
            <div className={style.operationBar}>
                <div>
                    <Search placeholder="输入流水线名称进行搜索" onSearch={onSearch} enterButton />
                </div>
                <div>
                    <Button type="primary" onClick={toRun} disabled={!hasSelected || deleteLoading} loading={runLoading} style={{ marginRight: 'var(--gap)' }}>
                        运行
                    </Button>
                    <Button onClick={() => toDelete()} disabled={!hasSelected || runLoading} loading={deleteLoading}>
                        删除
                    </Button>
                </div>
            </div>
            <div className={style.table}>
                <PipelineList
                    total={total}
                    current={current}
                    pageSize={pageSize}
                    dataSource={dataSource}
                    selectedIds={selectedIds}
                    onSelect={setSelectedIds}
                    onChange={onTableChange}
                    handlers={{
                        run: (e: DataType) => console.log(e),
                        edit: (e: DataType) => toEdit(e),
                        design: (e: DataType) => toDesing(e.id as string),
                        delete: (e: DataType) => toDelete(e.id as string),
                    }}
                >
                </PipelineList>
            </div>
            {
                isShowEditingModal ?
                    <Modal title="编辑" footer={null} open={true} onCancel={() => setEditingId(undefined)}>
                        <PipelineInfos okBtnLabel='确定' doAction={doEdit} defaults={editing}></PipelineInfos>
                    </Modal>
                    : null
            }
        </div>
    </>
}

export default Component;
