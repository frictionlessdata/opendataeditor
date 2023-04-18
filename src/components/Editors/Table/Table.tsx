import * as React from 'react'
import { StoreProvider, makeStore } from './store'
import { ThemeProvider } from '@mui/material/styles'
import { IReport } from '../../../interfaces'
import { ISchema, ITableLoader } from '../../../interfaces'
import * as themes from '../../../themes'
import Layout from './Layout'

export interface TableProps {
  loader: ITableLoader
  schema: ISchema
  report?: IReport
  height?: string
  onChange?: (rowNumber: number, fieldName: string, value: any) => void
  // Currently used only to rerender
  mode?: 'errors'
}

export default function Table(props: TableProps) {
  console.log(props)
  const store = React.useMemo(() => makeStore(props), Object.values(props))
  return (
    <ThemeProvider theme={themes.DEFAULT}>
      <StoreProvider value={store}>
        <Layout />
      </StoreProvider>
    </ThemeProvider>
  )
}
