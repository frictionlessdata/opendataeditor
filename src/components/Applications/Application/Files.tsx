import * as React from 'react'
import Empty from '../../Parts/Empty'
import Spinner from '../../Parts/Spinner'
import FileTree from '../../Parts/Trees/File'
import { useStore, selectors } from './store'

export default function Files() {
  const files = useStore((state) => state.files)
  const loading = useStore((state) => state.loading)
  return loading ? <LoadingFiles /> : files.length ? <PresentFiles /> : <EmptyFiles />
}

function PresentFiles() {
  const path = useStore((state) => state.path)
  const fileTree = useStore(selectors.fileTree)
  const fileEvent = useStore((state) => state.fileEvent)
  const onFileSelect = useStore((state) => state.onFileSelect)
  return (
    <React.Fragment>
      <FileTree
        tree={fileTree}
        event={fileEvent}
        selected={path}
        onSelect={onFileSelect}
      />
    </React.Fragment>
  )
}

function EmptyFiles() {
  return <Empty title="No Files Added" description='Use "Create" button to add files' />
}

function LoadingFiles() {
  return <Spinner message="Loading" />
}
