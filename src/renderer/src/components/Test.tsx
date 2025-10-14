import { Button } from 'antd';
import { useState } from 'react';
export default (): React.JSX.Element => {
    const [count, setCount] = useState(0);
    return <>
        <Button type='primary' onClick={() => setCount(count + 1)}>{count}</Button>
    </>
}