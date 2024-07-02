import { useStore } from './store'
import * as menu from '../../Parts/Bars/Menu'
import * as helpers from '../../../helpers'
import * as settings from '../../../settings'
import * as store from '@client/store'

export default function Menu() {
  const mode = useStore((state) => state.mode)
  const panel = store.useStore((state) => state.panel)
  const report = useStore((state) => state.report)
  const measure = useStore((state) => state.measure)
  const history = useStore((state) => state.history)
  const format = useStore((state) => state.record?.resource.format)
  const undoneHistory = useStore((state) => state.undoneHistory)
  const toggleErrorMode = useStore((state) => state.toggleErrorMode)
  const undoChange = useStore((state) => state.undoChange)
  const redoChange = useStore((state) => state.redoChange)

  return (
    <menu.MenuBar>
      <menu.MetadataButton
        active={panel === 'metadata'}
        onClick={() => store.togglePanel('metadata')}
      />
      <menu.ReportButton
        disabled={!report || report?.valid}
        active={panel === 'report'}
        onClick={() => store.togglePanel('report')}
      />
      <menu.SourceButton
        disabled={!helpers.getLanguageByFormat(format)}
        active={panel === 'source'}
        onClick={() => store.togglePanel('source')}
      />
      <menu.ChatButton
        disabled={!settings.TEXT_TABLE_FORMATS.includes(format || '')}
        onClick={() => store.toggleDialog('chat')}
      />
      <menu.ErrorsButton
        active={mode === 'errors'}
        onClick={toggleErrorMode}
        disabled={!measure?.errors}
      />
      <menu.UndoButton onClick={undoChange} disabled={!history?.changes.length} />
      <menu.RedoButton onClick={redoChange} disabled={!undoneHistory?.changes.length} />
    </menu.MenuBar>
  )
}
