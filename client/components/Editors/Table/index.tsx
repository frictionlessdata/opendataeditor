import InovuaDatagrid from '@inovua/reactdatagrid-community'
import '@inovua/reactdatagrid-community/index.css'
import {
  TypeComputedProps,
  TypeDataGridProps,
} from '@inovua/reactdatagrid-community/types'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import debounce from 'lodash/debounce'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import * as types from '../../../types'
import SpinnerCard from '../../Parts/Cards/Spinner'
import InputDialog from '../../Parts/Dialogs/Input'
import './assets/styles.css'
import { createColumns } from './columns'
import * as settings from './settings'

export type ITableEditor = TypeComputedProps | null
export interface TableEditorProps extends Partial<TypeDataGridProps> {
  source: types.ITableLoader | types.IRow[]
  schema: types.ISchema
  report: types.IReport
  errorIndex: types.IErrorIndex
  errorRowNumbers: number[]
  history: types.IHistory
  selection?: types.ITableSelection
  onColumnRename?: (props: { index: number; oldName: string; newName: string }) => void
}

export default function TableEditor(props: TableEditorProps) {
  const {
    source,
    schema,
    report,
    errorIndex,
    errorRowNumbers,
    history,
    selection,
    onColumnRename,
    ...others
  } = props
  const { t } = useTranslation()
  const [dialog, setDialog] = React.useState<IDialog | undefined>()

  const theme = useTheme()
  const colorPalette = theme.palette

  const columns = React.useMemo(
    () =>
      createColumns({
        schema,
        report,
        errorIndex,
        errorRowNumbers,
        history,
        selection,
        colorPalette,
      }),
    [schema, report, errorIndex, history, selection]
  )
  const [rowsPerPage, setRowsPerPage] = React.useState(20)
  const [userRowsPerPage, setUserRowsPerPage] = React.useState<number | undefined>()

  const [rowHeight] = React.useState(40)

  React.useEffect(() => {
    const debouncedHandleResize = debounce(function handleResize() {
      resizeTable()
    }, 300)

    const tableElement = document.querySelector('.InovuaReactDataGrid__column-layout')

    tableElement ? new ResizeObserver(debouncedHandleResize).observe(tableElement) : null

    return () => {
      tableElement
        ? new ResizeObserver(debouncedHandleResize).observe(tableElement)
        : null
    }
  })

  const renderColumnContextMenu = React.useCallback(
    (menuProps: { items: any[] }, context: any) => {
      menuProps.items = menuProps.items.filter(
        (item) => item.label !== 'Columns' && item !== '-'
      )
      menuProps.items.forEach((item: any) => {
        if (item.label === 'Sort ascending') item.label = t('sort-ascending')
        if (item.label === 'Sort descending') item.label = t('sort-descending')
        if (item.label === 'Unsort') item.label = t('unsort')
      })
      menuProps.items.push({
        itemId: 'rename',
        label: t('rename'),
        disabled: history?.changes.length,
        onClick: () => {
          setDialog({
            type: 'columnRename',
            name: context.cellProps.name,
            // first column is the row number column
            index: context.cellProps.columnIndex - 1,
          })
        },
      })
      return undefined
    },
    [history?.changes.length]
  )

  const renderPaginationToolbar = React.useCallback((paginationProps: any) => {
    paginationProps.pageText = t('pagination-page')
    paginationProps.ofText = t('pagination-of')
    paginationProps.perPageText = t('pagination-per-page')
    paginationProps.showingText = t('pagination-showing')
    return undefined
  }, [])

  function resizeTable() {
    // using a query selector here and not a ref because the tableRef selects the whole
    // table including the bottom pagination bar, so we would still need to use a querySelector
    // for selecting the pagination bar to get its height
    // see: https://github.com/okfn/opendataeditor/pull/364#discussion_r1589574167
    const tableElement = document.querySelector('.InovuaReactDataGrid__column-layout')
    const tableHeight = tableElement?.clientHeight as number
    // - 1 because we dont include header row
    setRowsPerPage(Math.floor(tableHeight / rowHeight) - 1)
  }

  return (
    <>
      <ColumnRenameDialog
        dialog={dialog}
        schema={schema}
        onClose={() => setDialog(undefined)}
        onColumnRename={onColumnRename}
      />
      <InovuaDatagrid
        onReady={resizeTable}
        idProperty="_rowNumber"
        dataSource={source}
        columns={columns}
        pagination={true}
        loadingText={<Typography>{t('loading')}...</Typography>}
        renderLoadMask={LoadMask}
        defaultActiveCell={settings.DEFAULT_ACTIVE_CELL}
        style={{ height: '100%', border: 'none' }}
        limit={userRowsPerPage || rowsPerPage}
        onLimitChange={setUserRowsPerPage}
        rowHeight={rowHeight}
        showColumnMenuLockOptions={false}
        showColumnMenuGroupOptions={false}
        enableColumnAutosize={false}
        renderColumnContextMenu={renderColumnContextMenu}
        renderPaginationToolbar={renderPaginationToolbar}
        {...others}
      />
    </>
  )
}

// TODO: move this dialog to global dialogs
type IDialog = IColumnRenameDialog

type IColumnRenameDialog = {
  type: 'columnRename'
  name: string
  index: number
}
function ColumnRenameDialog(props: {
  dialog?: IDialog
  onClose: () => void
  schema: types.ISchema
  onColumnRename: React.ComponentProps<typeof TableEditor>['onColumnRename']
}) {
  const { t } = useTranslation()
  const [name, setName] = React.useState(props.dialog?.name || '')

  if (props.dialog?.type !== 'columnRename') {
    return null
  }

  const isUpdated = name !== props.dialog.name
  const isUnique = !props.schema.fields.map((field) => field.name).includes(name)

  let errorMessage = ''
  if (!name) {
    errorMessage = t('name-must-not-be-blank')
  } else if (isUpdated && !isUnique) {
    errorMessage = t('name-must-be-unique')
  }

  return (
    <InputDialog
      open={true}
      value={name}
      description={t('enter-new-column-name')}
      onChange={setName}
      title={`${t('rename-column')} "${props.dialog.name}"`}
      onCancel={props.onClose}
      disabled={!isUpdated || !!errorMessage}
      errorMessage={errorMessage}
      onConfirm={() => {
        props.onColumnRename?.({
          index: props.dialog!.index,
          oldName: props.dialog!.name,
          newName: name,
        })
        props.onClose()
      }}
    />
  )
}

function LoadMask(props: { visible: boolean; zIndex: number }) {
  const { t } = useTranslation()
  if (!props.visible) return null

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        opacity: 0.6,
        background: 'rgba(121, 134, 203, 0.25)',
        zIndex: props.zIndex,
        position: 'absolute',
      }}
    >
      <SpinnerCard message={t('loading')} />
    </Box>
  )
}
