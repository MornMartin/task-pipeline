import { Rule } from "antd/es/form";
import { invalidChar, name } from "./rules";

export const generateRequireValidator = (message = '请输入'): Rule => {
    return { required: true, message }
}

export const generateNameValidator = (): Rule => {
    return {
        validator(rule, value) {
            if (name.test(value)) {
                return Promise.resolve();
            } else {
                return Promise.reject(new Error('请输入中英文字母和下划线'))
            }
        }
    }
}

export const generateDescriptionValidator = (): Rule => {
    return {
        validator(rule, value) {
            if (!value || !invalidChar.test(value)) {
                return Promise.resolve();
            } else {
                return Promise.reject("禁止输入<>");
            }
        }
    }
}
