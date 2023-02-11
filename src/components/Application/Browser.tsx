import * as React from 'react'
import Box from '@mui/material/Box'
import Files from '../Controllers/Files'
import { useStore } from './store'

export default function Layout() {
  const client = useStore((state) => state.client)
  const initialUpload = useStore((state) => state.initialUpload)
  const initialDataPackage = useStore((state) => state.initialDataPackage)
  const selectFile = useStore((state) => state.selectFile)
  return (
    <Box sx={{ borderRight: 'solid 1px #ddd' }}>
      <Files
        client={client}
        onFileChange={selectFile}
        initialUpload={initialUpload}
        initialDataPackage={initialDataPackage}
      />
    </Box>
  )
}
