/**
 * 调用数据库
 * @param apiName 
 * @param arg 
 * @returns 
 */
const callStorage = (apiName: string, ...arg): Promise<any> => {
    return window.api.callStorage(apiName, ...arg);
}

/**
 * 创建流水线
 * @param params 
 * @returns 
 */
export const createPipeline = (params: { name: string, descriptions?: string }) => {
    return callStorage('createPipeline', params);
}

/**
 * 删除流水线
 * @param id 
 * @returns 
 */
export const deletePipeline = (ids: (string | number)[]) => {
    return callStorage('deletePipeline', ids);
}

/**
 * 获取流水线数据
 * @param id 
 * @returns 
 */
export const getPipeline = (id: string) => {
    return callStorage('getPipeline', id);
}

/**
 * 获取流水线列表
 * @param query 
 * @returns 
 */
export const getPipelines = (name: string, pageSize: number, current: number, sorter: { sortField?: string, sortOrder?: string }) => {
    return callStorage('getPipelines', { name, pageSize, pageIndex: current - 1, sorter });
}

/**
 * 更新流水线画布信息
 * @param id 
 * @param params 
 * @returns 
 */
export const updatePipelineCanvasInfo = (id: string, params: { nodes: string, lines: string, variables: string }) => {
    return callStorage('updatePipelineCanvasInfo', id, params);
}

/**
 * 更新流水线基础信息
 * @param id 
 * @param params 
 * @returns 
 */
export const updatePipelineBasicInfo = (id: string, params: { name: string, descriptions?: string }) => {
    return callStorage('updatePipelineBasicInfo', id, params);
}
