import * as React from 'react'
import * as zustand from 'zustand'
import { assert } from 'ts-essentials'
import noop from 'lodash/noop'
import cloneDeep from 'lodash/cloneDeep'
import { createStore } from 'zustand/vanilla'
import { createSelector } from 'reselect'
import { IPackage, ILicense, IHelpItem } from '../../../interfaces'
import { PackageProps } from './Package'
import * as helpers from '../../../helpers'
import help from './help.yaml'

const INITIAL_PACKAGE: IPackage = { resources: [] }
const DEFAULT_HELP_ITEM = helpers.readHelpItem(help, 'package')!

interface ISectionState {
  query?: string
  index?: number
  isGrid?: boolean
  isExtras?: boolean
}

interface State {
  descriptor: IPackage
  onChange: (pkg: IPackage) => void
  helpItem: IHelpItem
  updateHelp: (path: string) => void

  // Package

  updatePackage: (patch: Partial<IPackage>) => void

  // Licenses

  licenseState: ISectionState
  updateLicenseState: (patch: Partial<ISectionState>) => void
  updateLicense: (patch: Partial<ILicense>) => void
  removeLicense: () => void
  addLicense: () => void
}

export function makeStore(props: PackageProps) {
  return createStore<State>((set, get) => ({
    descriptor: cloneDeep(props.package || INITIAL_PACKAGE),
    onChange: props.onChange || noop,
    helpItem: DEFAULT_HELP_ITEM,
    updateHelp: (path) => {
      const helpItem = helpers.readHelpItem(help, path) || DEFAULT_HELP_ITEM
      set({ helpItem })
    },

    // Package

    updatePackage: (patch) => {
      let { descriptor, onChange } = get()
      descriptor = { ...descriptor, ...patch }
      onChange(descriptor)
      set({ descriptor })
    },

    // Licenses

    licenseState: {},
    updateLicenseState: (patch) => {
      const { licenseState } = get()
      set({ licenseState: { ...licenseState, ...patch } })
    },
    updateLicense: (patch) => {
      const { descriptor, updatePackage } = get()
      const { index, license } = selectors.license(get())
      const licenses = descriptor.licenses!
      licenses[index] = { ...license, ...patch }
      updatePackage({ licenses })
    },
    removeLicense: () => {
      const { descriptor, updatePackage, updateLicenseState } = get()
      const { index } = selectors.license(get())
      const licenses = [...(descriptor.licenses || [])]
      licenses.splice(index, 1)
      updateLicenseState({ index: undefined, isExtras: false })
      updatePackage({ licenses })
    },
    // TODO: scroll to newly created license
    addLicense: () => {
      const { descriptor, updatePackage } = get()
      const licenses = [...(descriptor.licenses || [])]
      licenses.push({ name: 'MIT' })
      updatePackage({ licenses })
    },
  }))
}

export const select = createSelector
export const selectors = {
  // Licenses

  license: (state: State) => {
    const index = state.licenseState.index!
    const licenses = state.descriptor.licenses!
    const license = licenses[index]!
    return { index, license }
  },
  licenseItems: (state: State) => {
    const items = []
    const query = state.licenseState.query
    for (const [index, license] of (state.descriptor.licenses || []).entries()) {
      if (query && !license.name.includes(query)) continue
      items.push({ index, license })
    }
    return items
  },
}

export function useStore<R>(selector: (state: State) => R): R {
  const store = React.useContext(StoreContext)
  assert(store, 'store provider is required')
  return zustand.useStore(store, selector)
}

const StoreContext = React.createContext<zustand.StoreApi<State> | null>(null)
export const StoreProvider = StoreContext.Provider
