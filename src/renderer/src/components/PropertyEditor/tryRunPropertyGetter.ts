import { TPropertyDefine } from "./declare";

export default (func: any, propertyDefine: TPropertyDefine, propertyValues: Record<string, any> = {}, injects: Record<string, any> = {}) => {
    try {
        return typeof func === 'function' ? func.call(propertyDefine, propertyDefine, propertyValues, injects) : func;
    } catch (err) {
        console.error(err);
        return undefined;
    }
}