import { definePropertyCtrls } from "@renderer/components/PropertyEditor/methods";
import { defineAction, defineEvent } from "../../declare";
import { ECtrlType } from "@renderer/components/PropertyEditor/declare";

export default [
    defineAction(
        {
            id: 'request',
            label: "请求",
            paramDefines:
                definePropertyCtrls([
                    { key: 'api', type: ECtrlType.Input, label: '接口地址' },
                    { key: 'params', type: ECtrlType.Input, label: '请求参数' },
                    {
                        key: 'headers',
                        type: ECtrlType.List,
                        template: [{
                            type: ECtrlType.Collapse,
                            key: '',
                            label: 'Header',
                            children: definePropertyCtrls([
                                { type: ECtrlType.Input, key: 'key', label: '字段名称' },
                                { type: ECtrlType.Input, key: 'value', label: '字段值' }
                            ])
                        }]
                    }
                ]),
        },
        [
            { id: "onSuccess", label: "成功时" },
            { id: 'onFail', label: "失败时" }
        ]
    )
]