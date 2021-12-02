import create from 'zustand'
import { client } from '../../client'
import { IReport, IStatus, IRow } from '../../interfaces'
import { IInquiry, IDetector, IResource, IPipeline } from '../../interfaces'

export interface IState {
  contentType: string
  file?: File
  detector: IDetector
  resource?: IResource
  inquiry?: IInquiry
  report?: IReport
  pipeline?: IPipeline
  status?: IStatus
  text?: string
  rows?: IRow[]
  targetRows?: IRow[]
  isMetadataOpen?: boolean
  isSourceView?: boolean
}

export interface ILogic {
  setContentType: (contentType: string) => void
  toggleMetadataOpen: () => void
  toggleSourceView: () => void
  uploadFile: (file: File) => void
  updateDetector: (patch: Partial<IDetector>) => void
  updateResource: (patch: Partial<IResource>) => void
  updateInquiry: (patch: Partial<IInquiry>) => void
  updatePipeline: (patch: Partial<IPipeline>) => void
}

export const initialState = {
  isHelpView: true,
  contentType: 'help',
  // TODO: move to settings or server-side
  detector: { bufferSize: 10000, sampleSize: 100 },
}

export const useStore = create<IState & ILogic>((set, get) => ({
  ...initialState,

  // Page

  setContentType: (contentType) => set({ contentType }),
  toggleMetadataOpen: () => set({ isMetadataOpen: !get().isMetadataOpen }),
  toggleSourceView: () => set({ isSourceView: !get().isSourceView }),

  // File

  uploadFile: async (file) => {
    // TODO: implement properly
    if (file.type !== 'text/csv' || file.size > 10000000) {
      // TODO: clean file input
      alert('Currently only CSV files under 10Mb are supported')
      return
    }
    // TODO: find a proper place for it
    const text = await file.text()
    const { detector } = get()
    // TODO: make unblocking
    const { resource } = await client.describe(file, detector)
    // TODO: make unblocking
    const { rows } = await client.extract(file, resource)
    const inquiry = { source: resource, checks: [] }
    const pipeline = { source: resource, type: 'resource', steps: [] }
    set({ contentType: 'data', file, resource, rows, inquiry, pipeline, text })
  },

  // Metadata

  updateDetector: (patch) => {
    const { detector } = get()
    if (detector) set({ detector: { ...detector, ...patch } })
  },
  updateResource: (patch) => {
    const { resource } = get()
    if (resource) set({ resource: { ...resource, ...patch } })
  },
  updateInquiry: (patch) => {
    const { inquiry } = get()
    if (inquiry) set({ inquiry: { ...inquiry, ...patch } })
  },
  updatePipeline: (patch) => {
    const { pipeline } = get()
    if (pipeline) set({ pipeline: { ...pipeline, ...patch } })
  },
}))
