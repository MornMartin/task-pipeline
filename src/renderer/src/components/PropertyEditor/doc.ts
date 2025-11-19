
export interface IColumn {
    name: string,
    colspan?: number,
}

export interface IRow {
    cols: {
        value: string,
        colspan?: number,
        rowspan?: number
    }[]
}

export type TRowExtra = (IRow & { indent: number })

const createTable = (datas: IRow[], columns: IColumn[]): string => {
    return `
<table style="width:100%;">
    <thead>
        ${columns.map(item => `<th colspan="${item.colspan || 1}" style="white-space: nowrap;text-align: left;">${item.name}</th>`).join('\n\t\t')}
    </thead>
    <tbody style="width: 100%">
        ${datas.map(row => {
        return `<tr style="width: 100%;">
            ${row.cols.map(col => `<td rowspan="${col.rowspan || 1}" colspan="${col.colspan || 1}" style="white-space:pre-wrap;">${col.value}</td>`).join('\n\t\t\t')}
        </tr>`
    }).join('\n\t\t')}
    </tbody>
</table>
`
}

const createCommonColums = (totalCols = 4): IColumn[] => {
    return [
        { name: '字段名称', colspan: totalCols - 3 },
        { name: '字段类型' },
        { name: '默认值' },
        { name: '字段描述' }
    ]
}

const getDescribeByPath = (describes: Record<string, any>, paths: string[]): string | number | undefined => {
    let temp = describes;
    for (const item of paths) {
        temp = temp?.[item];
    }
    return typeof temp === 'object' ? '' : temp;
}

const createRowExtraFromStruct = (obj: Record<string, any>, describes: Record<string, any>, indent = 0, paths: string[] = []): TRowExtra[] => {
    if (typeof obj !== 'object') return [];
    if (Array.isArray(obj)) {
        const [defaultChild] = obj;
        // 数组不增加层级
        return typeof defaultChild === 'object' ? createRowExtraFromStruct(defaultChild, describes, indent, paths) : [];
    }
    let temp: TRowExtra[] = [];
    for (const key in obj) {
        const pathKey = paths.concat([key])
        const children = createRowExtraFromStruct(obj[key], describes, indent + 1, pathKey);
        // 子项不能为1，渲染table时会有样式问题
        const fillBlankRows = (children.length && children.length < 2)
            ? [{ cols: [{ value: '' }, { value: '' }, { value: '' }, { value: '' }], indent: indent + 1 }]
            : [];
        const row: TRowExtra = {
            cols: [
                {
                    value: key,
                },
                {
                    value: Array.isArray(obj[key]) ? 'array' : typeof obj[key],
                },
                {
                    value: typeof obj[key] === 'object' ? '' : obj[key],
                },
                {
                    value: getDescribeByPath(describes, pathKey) ?? describes[pathKey.join('.')] ?? '',
                },
            ],
            indent,
        }
        temp = temp.concat([row]).concat(children.concat(fillBlankRows))
    }
    return temp;
}

const transRowExtra2Row = (datas: TRowExtra[]): { maxCol: number, rows: IRow[] } => {
    let maxCol = 0;
    const indentGroups: (number[])[] = [];
    const rows: IRow[] = [];
    for (let i = 0, item: TRowExtra; (item = datas[i]); i++) {
        const indent = item.indent;
        maxCol = Math.max(maxCol, item.cols.length + indent);
        indentGroups.push(new Array(indent).fill('').map((e, i) => i + 1))
    }

    const getRowspan = (rowIndex: number, colIndex: number, target: number) => {
        const siblings: number[] = [];
        /**
         * 1
         * 1 2
         * 1 2
         * 1
         */
        for (let i = rowIndex, item; (item = indentGroups[i]); i++) {
            if (item[colIndex] === target) {// 获取列相同的连续行
                siblings.push(item)
            } else {
                return siblings.length;
            }
        }
        return siblings.length;
    }
    for (let i = 0, item; (item = indentGroups[i]); i++) {
        // 计算缩进填充列
        const indentCols = item.map((e, j) => {
            // rowspan 是向下传递，上一行设置了rowspan，下一行就不必再绘制改列的单元格
            const isFirstSiblings = !indentGroups[i - 1]?.[j];
            return { rowspan: isFirstSiblings ? getRowspan(i, j, e) : 1 }
        })
        // 转换行数据配置
        const row = datas[i];
        const [firstCol] = row.cols;
        const rowspanCols = indentCols.filter(c => {
            return c.rowspan > 1;// 非rowspan向下传递列既被传递列，不写入
        }).map(c => {
            return { value: '', rowspan: c.rowspan }
        });
        const colspan = (maxCol + 1) - row.cols.length - indentCols.length;
        rows.push({
            cols: [
                ...rowspanCols,
                { ...firstCol, colspan },
                ...row.cols.slice(1),
            ]
        })
    }
    return { maxCol, rows }
}

export const createPropertyTable = (obj: Record<string, any>, describes: Record<string, string>): string => {
    const datas = createRowExtraFromStruct(obj, describes)
    const { maxCol, rows } = transRowExtra2Row(datas)
    return createTable(rows, createCommonColums(maxCol));
}

export const createSection = (title: string, content: string, level = 1) => {
    return `${'#'.repeat(level)} ${title}\n${content}\n`
}
