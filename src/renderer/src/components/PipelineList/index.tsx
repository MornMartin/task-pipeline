import { Space, Table, TableColumnsType, TableProps, Tooltip } from 'antd';
import style from './index.module.less'
import { useEffect, useRef, useState } from 'react'
import { debounce } from '@renderer/utils/methods';

const updateScrollHeightDebounce = debounce();

type Thandlers = Record<'run' | 'edit' | 'design' | 'delete', (e: DataType) => void>;

interface IProps {
    total: number;
    pageSize: number;
    current: number;
    dataSource: DataType[];
    selectedIds: React.Key[];
    onSelect: (e: React.Key[]) => void;
    onChange: (pagination: any, filters: any, sorter: any, extra: any) => void;
    handlers: Thandlers;
}

type TableRowSelection<T extends object = object> = TableProps<T>['rowSelection'];

interface DataType {
    id: React.Key;
    name: string;
    descriptions: string;
    updated_at: string;
    created_at: string;
}

const renderTooltip = (content) => <Tooltip placement="topLeft" title={content}> {content} </Tooltip>

const renderOperations = (_: any, record: DataType, handlers: Thandlers) => {
    return <>
        <Space size="middle">
            <a onClick={() => handlers.run(record)}>运行</a>
            <a onClick={() => handlers.edit(record)}>编辑</a>
            <a onClick={() => handlers.design(record)}>设计</a>
            <a onClick={() => handlers.delete(record)}>删除</a>
        </Space>
    </>
}

const createColumns = (handlers: Thandlers): TableColumnsType<DataType> => {
    return [
        { title: '名称', dataIndex: 'name', ellipsis: { showTitle: false }, render: renderTooltip },
        { title: '描述', dataIndex: 'descriptions', ellipsis: { showTitle: false }, render: renderTooltip },
        { title: '更新时间', dataIndex: 'updated_at', sorter: true, sortDirections: ['ascend', 'descend'] },
        { title: '创建时间', dataIndex: 'created_at', sorter: true, sortDirections: ['ascend', 'descend'] },
        { title: '操作', dataIndex: 'operations', render: (_: any, record: DataType) => renderOperations(_, record, handlers) },
    ];
}

const Component: React.FC<IProps & Record<string, any>> = (props): React.JSX.Element => {
    const { dataSource = [], total = 0, pageSize = 10, current = 1, selectedIds = [], onChange, onSelect, handlers } = props;
    const wrap = useRef<HTMLDivElement>(null);
    const [scrollHeight, setScrollHeight] = useState(0);

    const updateScrollHeight = () => {
        updateScrollHeightDebounce(() => {
            if (!wrap.current) return;
            const { height } = wrap.current.getBoundingClientRect();
            const paginationHeight = 44;
            const tableHeadHeight = 37;
            setScrollHeight(height - paginationHeight - tableHeadHeight);
        })
    }

    const onPagination = (pagination, filters, sorter, extra) => {
        onChange(pagination, filters, sorter, extra);
        onSelect([]);
    }

    useEffect(updateScrollHeight, [wrap])

    useEffect(() => {
        const listener = () => {
            updateScrollHeight();
        }
        window.addEventListener('resize', listener)
        return () => {
            window.removeEventListener('resize', listener);
        }
    }, [])

    const rowSelection: TableRowSelection<DataType> = { selectedRowKeys: selectedIds, onChange: onSelect };

    return <>
        <div className={style.PipelineList} ref={wrap} style={{ ['--tbody-height']: `${scrollHeight}px` } as any}>
            <Table<DataType>
                rowKey={'id'}
                scroll={{ y: scrollHeight }}
                rowSelection={rowSelection}
                columns={createColumns(handlers)}
                dataSource={dataSource}
                pagination={{ total, pageSize, current, hideOnSinglePage: false }}
                onChange={onPagination}
            >
            </Table>
        </div>
    </>
}

export default Component;
