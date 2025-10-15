const mock = <T>(data: T, delay = 500, isSuccess = true): Promise<T> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            isSuccess ? resolve(data) : reject(data);
        }, delay);
    })
}

export const createPipeline = (params: Record<'name' | string, any>) => {
    return mock<Record<'id', string>>({ id: 'xxx' });
}