import { useLoaderData, useNavigate } from 'react-router';
import style from './index.module.less'
import { useRef, useState } from 'react'
import { Form, Input, Button, FormInstance } from 'antd';
import { generateDescriptionValidator, generateNameValidator, generateRequireValidator } from '@renderer/utils/validators';
import { formItemLayout } from '@renderer/utils/settings';
import { createPipeline } from '@renderer/api';

interface IFields {
    name: string;
    description: string;
}

interface IProps { }

const Component: React.FC<IProps & Record<string, any>> = (): React.JSX.Element => {
    const form = useRef<FormInstance>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const toCreatePipeline = async () => {
        try {
            setIsLoading(true);
            if (!form.current) throw Error('初始化表单失败');
            await form.current.validateFields();
            const params = form.current.getFieldsValue();
            const { id } = await createPipeline(params);
            setIsLoading(false);
            navigate(`/pipelineDesigner/${id}`);
        } catch (err) {
            setIsLoading(false);
        }
    }
    return <>
        <div className={style.PipelineDesigner}>
            <div>
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
                        name="description"
                        rules={[generateDescriptionValidator()]}
                    >
                        <Input.TextArea maxLength={1024} style={{ resize: 'none' }} />
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
