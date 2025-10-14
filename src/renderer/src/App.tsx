import { router, RouterProvider } from '@renderer/route/index'
export default (): React.JSX.Element => {
    const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

    return (
        <>
            <RouterProvider router={router}></RouterProvider>
        </>
    )
}
