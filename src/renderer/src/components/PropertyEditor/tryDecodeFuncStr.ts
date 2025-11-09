export default (str: string) => {
    try {
        //unsafe-eval
        const handler = eval(str);
        return typeof handler === 'function' ? handler : str;
    } catch (err) {
        return str;
    }
}