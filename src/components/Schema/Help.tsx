import * as React from 'react'
import HelpCard from '../Library/HelpCard'

// TODO: remove height calc
//
export default function Help() {
  return (
    <HelpCard
      title="Schema"
      subtitle="overview"
      height="calc(100% - 8px)"
      link="https://framework.frictionlessdata.io/docs/guides/describing-data#describing-a-schema"
    >
      Table Schema is a specification for providing a schema (similar to a database
      schema) for tabular data. This information includes the expected data type for each
      value in a column, constraints on the value, and the expected format of the data.
    </HelpCard>
  )
}
