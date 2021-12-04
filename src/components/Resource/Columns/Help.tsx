import * as React from 'react'
import { useTheme } from '@mui/material/styles'
import HelpCard from '../../Library/HelpCard'

// TODO: remove height calc?

export default function Help() {
  const theme = useTheme()
  return (
    <HelpCard
      title="Resource"
      subtitle="overview"
      height={`calc(100% - ${theme.spacing(1)})`}
      link="https://framework.frictionlessdata.io/docs/guides/describing-data#describing-a-resource"
    >
      The Data Resource format describes a data resource such as an individual file or
      data table. The essence of a Data Resource is a path to the data file it describes.
      A range of other properties can be declared to provide a richer set of metadata
      including Table Schema for tabular data and File Dialect.
    </HelpCard>
  )
}
