import { saveChangesDialog } from '@client/components/Application/Dialogs/SaveChanges'
import * as store from '@client/store'
import Box from '@mui/material/Box'
import * as action from '../../Parts/Bars/Action'
import * as menu from '../../Parts/Bars/Menu'

export default function Menu() {
  const panel = store.useStore((state) => state.panel)
  const report = store.useStore((state) => state.report)
  const history = store.useStore((state) => state.table?.history)
  const source = store.useStore((state) => state.source)
  const undoneHistory = store.useStore((state) => state.table?.undoneHistory)

  const isTableUpdated = store.useStore(store.getIsTableOrResourceUpdated)

  return (
    <menu.MenuBar fullWidth>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <menu.MetadataButton
            active={panel === 'metadata'}
            onClick={() => store.togglePanel('metadata')}
            color="OKFNCoolGray"
          />
          <menu.ReportButton
            disabled={!report || report?.valid}
            active={panel === 'report'}
            onClick={() => store.togglePanel('report')}
            color="OKFNCoolGray"
            numberErrors={report?.stats.errors}
          />
          <menu.SourceButton
            disabled={!source?.text}
            active={panel === 'source'}
            onClick={() => store.togglePanel('source')}
            color="OKFNCoolGray"
          />
          <menu.UndoButton
            onClick={store.undoTableChange}
            disabled={!history?.changes.length}
            color="OKFNCoolGray"
          />
          <menu.RedoButton
            onClick={store.redoTableChange}
            disabled={!undoneHistory?.changes.length}
            color="OKFNCoolGray"
          />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
          <action.AssistantButton onClick={() => store.openDialog('assistant')} />
          <action.ExportButton
            disabled={panel !== 'metadata'}
            onClick={() => store.openDialog('exporter')}
          />
          <action.PublishButton
            disabled={isTableUpdated}
            onClick={() => store.openDialog('publish')}
          />
          <action.SaveButton
            updated={isTableUpdated}
            onClick={saveChangesDialog.saveChanges}
          />
        </Box>
      </Box>
    </menu.MenuBar>
  )
}
