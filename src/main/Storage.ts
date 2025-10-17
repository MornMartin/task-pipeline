import Database from 'better-sqlite3';

/**
 * 表字段数据类型
 */
export type TTableFieldDataType = 'INTEGER' | 'FLOAT' | 'TEXT' | 'TIMESTAMP' | 'BOOLEAN' | 'VARCHAR(256)' | 'VARCHAR(1024)' | 'VARCHAR(2048)';

/**
 * 表字段约束
 */
export type TTableFieldConstraints = 'NOT NULL' | 'UNIQUE' | 'PRIMARY KEY' | 'FOREIGN KEY' | 'DEFAULT';

/**
 * 表字段值
 */
export type TTableFieldDefault = 'AUTOINCREMENT' | 'CURRENT_TIMESTAMP' | string | number;

/**
 * 表字段配置定义
 */
export interface ITableField {
    dataType: TTableFieldDataType;
    constraints?: TTableFieldConstraints;
    default?: TTableFieldDefault;
}
/**
 * 生成基础表字段
 * @returns 
 */
const createTableBaseFields = (): Record<'id' | 'name' | 'updated_at' | 'created_at', ITableField> => {
    return {
        id: {
            dataType: 'INTEGER',
            constraints: 'PRIMARY KEY',
            default: 'AUTOINCREMENT',
        },
        name: {
            dataType: 'VARCHAR(256)',
            constraints: 'UNIQUE',
        },
        updated_at: {
            dataType: 'TIMESTAMP',
        },
        created_at: {
            dataType: 'TIMESTAMP',
            constraints: 'DEFAULT',
            default: 'CURRENT_TIMESTAMP',
        },
    }
}
/**
 * 生成流水线表字段
 * @returns 
 */
const createPipelineTableFields = (): Record<string, ITableField> => {
    return {
        ...createTableBaseFields(),
        descriptions: {
            dataType: 'VARCHAR(2048)',
        },
        nodes: {
            dataType: 'TEXT',
        },
        lines: {
            dataType: 'TEXT'
        },
        variables: {
            dataType: 'TEXT',
        },
    }
}
/**
 * 生成任务表字段
 * @returns 
 */
const createJobTableFields = (): Record<string, ITableField> => {
    return {
        ...createTableBaseFields(),
        pipeline_id: {
            dataType: 'INTEGER',
            constraints: 'NOT NULL',
        },
        status: {
            dataType: 'VARCHAR(256)',
        },
        current_node_id: {
            dataType: 'VARCHAR(256)',
        },
        current_endpoint_id: {
            dataType: 'VARCHAR(256)',
        },
    }
}

const createLogTableFields = (): Record<string, ITableField> => {
    return {
        id: {
            dataType: 'INTEGER',
            constraints: 'PRIMARY KEY',
            default: 'AUTOINCREMENT',
        },
        action: {
            dataType: 'VARCHAR(256)',
            constraints: 'UNIQUE',
        },
        details: {
            dataType: 'VARCHAR(2048)',
        },
        created_at: {
            dataType: 'TIMESTAMP',
            constraints: 'DEFAULT',
            default: 'CURRENT_TIMESTAMP',
        },
    }
}

/**
 * 生成建表字段语句
 * @param fields 
 * @returns 
 */
const createTableFieldStatement = (fields: Record<string, ITableField> = {}, extra: string = ''): string => {
    return Object.keys(fields).map(key => {
        const config = fields[key] as ITableField || {};
        return `\t${key} ${config.dataType ?? ''} ${config.constraints ?? ''} ${config.default ?? ''}`
    }).join(',\n').concat(extra);
}

export default class Storage {
    private db: Database;
    constructor(path: string, dbname: string = 'Storage.db') {
        this.db = new Database(`${path}/${dbname}`, { verbose: console.log });
        this.createTable('LOGS', createLogTableFields());// 创建日志表
        this.createTable('PIPELINES', createPipelineTableFields());// 创建流水线表
        this.createTable('JOBS', createJobTableFields(), ',\n\tFOREIGN KEY (pipeline_id) REFERENCES PIPELINES(id)');// 创建任务表
    }
    /**
     * 建表
     * @param tableName 表名称
     * @param fields 表字段
     */
    private createTable(tableName: string, fields: Record<string, ITableField>, extra: string = '') {
        this.db.exec(`CREATE TABLE IF NOT EXISTS ${tableName} (\n${createTableFieldStatement(fields, extra)}\n);`);
    }
    /**
     * 创建流水线
     * @param params 
     * @returns 
     */
    public createPipeline(params: { name: string, descriptions: string }) {
        try {
            const { name = '', descriptions = '' } = params || {};
            const { lastInsertRowid } = this.db.prepare('INSERT INTO PIPELINES (name, descriptions) VALUES (@name, @descriptions)').run({ name, descriptions });
            return Promise.resolve(lastInsertRowid);
        } catch (err) {
            return Promise.reject(err);
        }
    }
    /**
     * 删除流水线
     * @param id 
     * @returns 
     */
    public deletePipeline(id: string[]) {
        try {
            const ids = Array.isArray(id) ? id : [id];
            const { changes } = this.db.prepare(`DELETE FROM PIPELINES WHERE id IN (${ids.map(i => '?').join(', ')})`).run(...ids);
            if (!changes) {
                return Promise.reject(`Pipeline ${id} is not existed.`)
            }
            if (changes && changes < ids.length) {
                return Promise.reject(`Pipeline partially deleted successfully.`)
            }
            return Promise.resolve('ok!');
        } catch (err) {
            return Promise.reject(err);
        }
    }
    /**
     * 获取流水线数据
     * @param id 
     * @returns 
     */
    public getPipeline(id: string) {
        try {
            const res = this.db.prepare('SELECT * FROM PIPELINES WHERE id = @id').get({ id });
            if (!res) {
                return Promise.reject(`Pipeline ${id} is not existed.`)
            }
            return Promise.resolve(res);
        } catch (err) {
            return Promise.reject(err);
        }
    }
    /**
     * 获取流水线列表
     * @param query 
     * @returns 
     */
    public getPipelines(query: { name: string, pageSize: number, pageIndex: number }) {
        try {
            const { name = '', pageSize = 10, pageIndex = 0 } = query || {};
            const { total } = this.db.prepare('SELECT COUNT(*) as total FROM PIPELINES WHERE name LIKE @name').get({ name: `%${name}%` });
            const toQuery = this.db.prepare('SELECT * FROM PIPELINES WHERE name LIKE @name ORDER BY created_at DESC LIMIT @limit OFFSET @offset');
            const data = Array.from(toQuery.iterate({ name: `%${name}%`, limit: pageSize, offset: pageIndex * pageSize }));
            return Promise.resolve({ total, pageSize, pageIndex, data });
        } catch (err) {
            return Promise.reject(err);
        }
    }
    /**
     * 更新流水线画布信息
     * @param id 
     * @param params 
     * @returns 
     */
    public updatePipelineCanvasInfo(id: string, params: { nodes: string, lines: string, variables: string }) {
        try {
            const { nodes = '', lines = '', variables = '' } = params || {};
            const { changes } = this.db.prepare('UPDATE PIPELINES SET nodes = @nodes, lines = @lines, variables = @variables WHERE id = @id').run({ id, nodes, lines, variables });
            if (!changes) {
                return Promise.reject(`Pipeline ${id} is not existed.`)
            }
            return Promise.resolve('ok!');
        } catch (err) {
            return Promise.reject(err);
        }
    }
    /**
     * 更新流水线基础信息
     * @param id 
     * @param params 
     * @returns 
     */
    public updatePipelineBasicInfo(id: string, params: { name: string, descriptions: string }) {
        try {
            const { name = '', descriptions = '' } = params || {}
            const { changes } = this.db.prepare('UPDATE PIPELINES SET name = @name, descriptions = @descriptions WHERE id = @id').run({ id, name, descriptions });
            if (!changes) {
                return Promise.reject(`Pipeline ${id} is not existed.`)
            }
            return Promise.resolve('ok!');
        } catch (err) {
            return Promise.reject(err);
        }
    }
    /**
     * 关闭数据库连接
     */
    close() {
        this.db.close();
    }
}