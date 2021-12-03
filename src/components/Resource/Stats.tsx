import * as React from 'react'
import Heading from '../Library/Heading'
import InputField from '../Library/Fields/InputField'
import { useStore } from './store'

export default function Stats() {
  const descriptor = useStore((state) => state.descriptor)

  // Components

  const Stats = () => (
    <React.Fragment>
      <Heading variant="h6">Stats</Heading>
      <Hash />
      <Bytes />
      <Fields />
      <Rows />
    </React.Fragment>
  )

  const Hash = () => (
    <React.Fragment>
      <InputField disabled label="Hash" value={descriptor.stats.hash} />
    </React.Fragment>
  )

  const Bytes = () => (
    <React.Fragment>
      <InputField disabled label="Bytes" value={descriptor.stats.bytes} />
    </React.Fragment>
  )

  const Fields = () => (
    <React.Fragment>
      <InputField disabled label="Fields" value={descriptor.stats.fields} />
    </React.Fragment>
  )

  const Rows = () => (
    <React.Fragment>
      <InputField disabled label="Rows" value={descriptor.stats.rows} />
    </React.Fragment>
  )

  return <Stats />
}
