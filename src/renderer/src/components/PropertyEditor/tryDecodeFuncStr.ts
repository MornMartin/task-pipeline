export default (str: string) => {
    try {
        //unsafe-eval
        const handler = eval(str);// 处理箭头函数
        return typeof handler === 'function' ? handler : str;
    } catch (err) {
        try {
            const handler = eval(`(function ${str})`);// 处理对象定义方法函数
            return typeof handler === 'function' ? handler : str
        } catch (err) {
            return str;
        }
    }
}