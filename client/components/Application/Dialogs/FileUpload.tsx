import * as React from 'react'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import DialogContent from '@mui/material/DialogContent'
import CloseIcon from '@mui/icons-material/Close'
import * as store from '@client/store'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { styled } from '@mui/material/styles'
import uploadFilesDialogImg from '../../../assets/dialog_upload_files.png'
import iconUploadFileImg from '../../../assets/icon_upload_file.png'
import iconUploadFolderImg from '../../../assets/folder-open-big-plus.png'
import Columns from '../../Parts/Grids/Columns'

export interface FileUploadDialogProps {
  open?: boolean
  title?: string
  description?: string
  Icon?: React.ElementType
  label?: string
  cancelLabel?: string
  loading?: boolean
  disabled?: boolean
  maxWidth?: 'md' | 'xl'
  onCancel?: () => void
  onConfirm?: () => void
  ctrlEnter?: boolean
  children?: React.ReactNode
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const StyledTab = styled(Tab)(() => ({
  textTransform: 'none',
  fontWeight: 600,
  '&.Mui-selected': {
    color: '#00D1FF',
  },
}))

const StyledBox = styled(Box)(() => ({
  border: '1px solid #E7E9E9',
  borderRadius: '8px',
  textAlign: 'center',
  padding: '32px 48px 24px 48px',
  color: '#717879',
  fontSize: '14px',
  cursor: 'pointer',
}))

const StyledSelectBox = styled(Box)(() => ({
  marginTop: '28px',
  backgroundColor: '#FAFAFA',
  padding: '4px 10px',
  borderRadius: '4px',
  border: '0.5px solid #D3D7D8',
  boxShadow: '0px 0px 0px 0px rgba(0, 0, 0, 0.25)',
}))

export default function FileUploadDialog(props: FileUploadDialogProps) {
  const handleCancel = () => props.onCancel && props.onCancel()
  const handleConfirm = () => props.onConfirm && props.onConfirm()

  const handleClose = () => {
    store.closeDialog()
  }

  const [value, setValue] = React.useState(0)

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    }
  }

  // @ts-ignore
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    )
  }

  const inputFileRef = React.useRef<HTMLInputElement>(null)

  return (
    <Dialog
      fullWidth
      maxWidth={props.maxWidth}
      open={true}
      onClose={!props.loading ? handleCancel : undefined}
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
      onKeyDown={(event) => {
        if ((!props.ctrlEnter || event.ctrlKey) && event.key === 'Enter') handleConfirm()
      }}
    >
      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ paddingTop: 0, paddingBottom: '82px' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '74px',
            paddingBottom: '33px',
          }}
        >
          <img src={uploadFilesDialogImg} alt="Image Folder Dialog" />
        </Box>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
            TabIndicatorProps={{
              style: {
                backgroundColor: '#00D1FF',
              },
            }}
            centered
          >
            <StyledTab label="From your computer" {...a11yProps(0)} />
            <StyledTab label="Add external data" {...a11yProps(1)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <Columns columns={2} spacing={4}>
            <StyledBox onClick={() => console.log('clicked box')}>
              <input
                type="file"
                hidden
                multiple
                ref={inputFileRef}
                onChange={(ev: React.ChangeEvent<HTMLInputElement>) => {
                  if (ev.target.files) store.addFiles(ev.target.files)
                }}
              />
              <Box>
                <img src={iconUploadFileImg} alt="Icon Upload File" />
              </Box>
              <Box>Add one or more Excel or csv files </Box>
              <StyledSelectBox>Select F</StyledSelectBox>
            </StyledBox>
            <StyledBox>
              <Box>
                <img src={iconUploadFolderImg} alt="Icon Upload File" />
              </Box>
              <Box>Add one or more folders</Box>
              <StyledSelectBox>Select G</StyledSelectBox>
            </StyledBox>
          </Columns>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          Add external data
        </CustomTabPanel>
      </DialogContent>
    </Dialog>
  )
}
