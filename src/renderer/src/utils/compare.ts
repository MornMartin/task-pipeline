/**
 * 对比两个对象/数组是否值相等
 * @param source
 * @param target
 * @param config
 * @returns
 */
export const compare = (
    source: any,
    target: any,
    config: {
        isStrict?: boolean;
        handleEqual?: (a: any, b: any) => boolean,
        onNotEqual?: (source: any, target: any, paths?: string[]) => void;
    } = { isStrict: true }
): boolean => {
    const getValue = (obj: any, path: string) => {
        try {
            return obj[path];
        } catch {
            return undefined;
        }
    };
    const onNotEqual = (a: any, b: any, paths?: string[]) => {
        try {
            typeof config.onNotEqual === "function" && config.onNotEqual(a, b, paths);
        } catch (err) {
            console.error(err);
        }
    };
    const doCompareSimple = (a: any, b: any, paths: string[] = []) => {
        const isEqual = typeof config.handleEqual === 'function' ? config.handleEqual(a, b) : (config.isStrict ? a === b : a == b);
        if (!isEqual) {
            onNotEqual(a, b, paths);
        }
        return isEqual;
    };
    const doCompareObject = (a: Record<string, any>, b: any, paths: string[] = [], isNeedReversed = true) => {
        // a为非空对象，b为空对象时
        if (!b) return false;
        const keys = Object.keys(a);
        for (let i = 0, key; (key = keys[i]); i++) {
            const sourceValue = getValue(a, key);
            const targetValue = getValue(b, key);
            const isEqual = sourceValue && typeof sourceValue === "object"
                ? doCompareObject(sourceValue, targetValue, paths.concat(key), false)
                : doCompareSimple(sourceValue, targetValue, paths.concat(key));
            if (!isEqual) return false;
        }
        // 对比完 a->b 再反过来对比 b->a
        if (isNeedReversed) {
            return doCompareObject(b, a, [], false);
        }
        return true;
    };
    if (typeof source === "object" && source) {
        // 对比复杂类型
        return doCompareObject(source, target);
    }
    // 对比简单类型
    return doCompareSimple(source, target);
};