import { client } from '@client/client'
import * as helpers from '@client/helpers'
import * as appStore from '@client/store'
import * as types from '@client/types'
import { t } from 'i18next'

class State {
  progress?: types.IProgress
}

export const { state, useState, resetState } = helpers.createState(
  'DeleteFileDialog',
  new State()
)

export function closeDialog() {
  if (!state.progress?.blocking) {
    appStore.closeDialog()
  }
}

export async function deleteFile() {
  const isFolder = appStore.getIsFolder(appStore.getState())
  const { path } = appStore.getState()
  if (!path) return

  const target = isFolder ? 'folder' : 'file'

  state.progress = {
    type: 'deleting',
    title: `${t('deleting-selected')} ${target}`,
    blocking: true,
  }

  const result = isFolder
    ? await client.folderDelete({ path })
    : await client.fileDelete({ path })

  if (result instanceof client.Error) {
    state.progress = {
      type: 'error',
      title: `${t('error-deleting')} ${target}`,
      message: result.detail,
    }
    return
  }

  appStore.onFileDeleted([path])
  state.progress = undefined
  closeDialog()
}
