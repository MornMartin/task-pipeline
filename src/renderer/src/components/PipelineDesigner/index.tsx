import { useNavigate } from 'react-router';
import style from './index.module.less'
import { useRef, useState } from 'react'
import { Form, Input, Button, FormInstance } from 'antd';
import { generateDescriptionValidator, generateNameValidator, generateRequireValidator } from '@renderer/utils/validators';
import { formItemLayout } from '@renderer/utils/settings';
import { createPipeline } from '@renderer/api';
import { errorMsg } from '@renderer/utils/message';

interface IFields {
    name: string;
    descriptions: string;
}

interface IProps { }

const Component: React.FC<IProps & Record<string, any>> = (): React.JSX.Element => {
    const form = useRef<FormInstance>(null);
    const [message, contextHolder] = errorMsg()
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const toCreatePipeline = async () => {
        try {
            setIsLoading(true);
            if (!form.current) throw Error('初始化表单失败');
            await form.current.validateFields();
            const params = form.current.getFieldsValue();
            const id = await createPipeline(params);
            setIsLoading(false);
            navigate(`/pipelineDesigner/${id}`);
        } catch (err: any) {
            const [verifyError] = err?.errorFields;
            setIsLoading(false);
            verifyError ? '' : message(err?.message ?? err);
        }
    }
    return <>
        <div className={style.PipelineDesigner}>
            <div>
                {contextHolder}
                <Form {...formItemLayout} ref={form}>
                    <Form.Item<IFields>
                        label="名称"
                        name="name"
                        validateFirst
                        rules={[generateRequireValidator('请输入流水线名称'), generateNameValidator()]}
                    >
                        <Input maxLength={64} />
                    </Form.Item>
                    <Form.Item<IFields>
                        label="描述"
                        name="descriptions"
                        rules={[generateDescriptionValidator()]}
                    >
                        <Input.TextArea maxLength={1024} style={{ resize: 'none', height: '160px' }} />
                    </Form.Item>
                    <Form.Item label={null}>
                        <Button type="primary" htmlType="button" loading={isLoading} onClick={toCreatePipeline}>创建</Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    </>
}

export default Component;
