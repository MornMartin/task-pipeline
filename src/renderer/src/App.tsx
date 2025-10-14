import Test from './components/Test.tsx';
export default (): React.JSX.Element => {
    const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

    return <>
        <Test></Test>
    </>
}
