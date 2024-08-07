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
import iconLinkTextField from '../../../assets/icon_link_textfield.svg'
import Columns from '../../Parts/Grids/Columns'
import SimpleButton from '../../Parts/Buttons/SimpleButton'
import TextField from '@mui/material/TextField'
import LinearProgress from '@mui/material/LinearProgress'
import InputAdornment from '@mui/material/InputAdornment'
import * as helpers from '../../../helpers'

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

export default function FileUploadDialog(props: FileUploadDialogProps) {
  const handleCancel = () => props.onCancel && props.onCancel()
  const handleConfirm = () => props.onConfirm && props.onConfirm()

  const [errorMessage, setErrorMessage] = React.useState('')

  const handleClose = () => {
    store.closeDialog()
  }

  const [value, setValue] = React.useState(0)

  const [remoteUrlValue, setRemoteUrlValue] = React.useState('')

  const [loading, setLoading] = React.useState(false)

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    }
  }

  // the event needs to be passed even if not used, disabling here so there's
  // no unused variable error in the typescript check
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

  const onAddRemoteTextfieldChange = (url: string) => {
    if (errorMessage) {
      setErrorMessage('')
    } else {
      setRemoteUrlValue(url)
    }
    console.log('url', url)
  }

  const onAddRemoteConfirm = async (url: string) => {
    if (!url) {
      setErrorMessage('The URL is blank')
      return
    }

    if (!helpers.isUrlValid(url)) {
      setErrorMessage('The URL is not valid')
      return
    }

    try {
      setLoading(true)
      await store.fetchFile(url)
    } catch (error) {
      setErrorMessage('The URL is not associated with a table')
      return
    } finally {
      setLoading(false)
    }

    store.closeDialog()
  }

  const isWebkitDirectorySupported = 'webkitdirectory' in document.createElement('input')
  if (!isWebkitDirectorySupported) return null

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
                multiple
                ref={inputFileRef}
                onChange={(ev: React.ChangeEvent<HTMLInputElement>) => {
                  if (ev.target.files) {
                    store.addFiles(ev.target.files)
                    store.closeDialog()
                  }
                }}
              />
              <Box sx={{ padding: '32px 48px 24px 48px' }}>
                <Box>
                  <img src={iconUploadFileImg} alt="Icon Upload File" />
                </Box>
                <Box>Add one or more Excel or csv files </Box>
                <StyledSelectBox>
                  Select <span>F</span>
                </StyledSelectBox>
              </Box>
            </StyledBox>
            <StyledBox>
              <input
                type="file"
                multiple
                ref={inputFileRef}
                onChange={(ev: React.ChangeEvent<HTMLInputElement>) => {
                  if (ev.target.files) {
                    store.addFiles(ev.target.files)
                    store.closeDialog()
                  }
                }}
                // @ts-expect-error
                webkitdirectory=""
              />
              <Box sx={{ padding: '32px 48px 24px 48px' }}>
                <Box>
                  <img src={iconUploadFolderImg} alt="Icon Upload File" />
                </Box>
                <Box>Add one or more folders</Box>
                <StyledSelectBox>
                  Select <span>G</span>
                </StyledSelectBox>
              </Box>
            </StyledBox>
          </Columns>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <Box sx={{ paddingLeft: '140px', paddingRight: '140px' }}>
            <Box
              sx={{
                fontSize: '14px',
              }}
            >
              Link to the external table:
            </Box>
            <StyledTextField
              fullWidth
              size="small"
              helperText={errorMessage}
              placeholder="Enter or paste URL"
              InputLabelProps={{
                sx: {
                  fontSize: '14px',
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <img src={iconLinkTextField} alt="" />
                  </InputAdornment>
                ),
                sx: {
                  '& ::placeholder': {
                    color: '#D1D4DB',
                    opacity: 1, // otherwise firefox shows a lighter colorS
                    fontSize: '14px',
                  },
                },
              }}
              value={remoteUrlValue}
              onChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
                onAddRemoteTextfieldChange(ev.target.value)
              }
            />
            {loading ? (
              <LinearProgress
                sx={{
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#00D1FF',
                  },
                }}
              />
            ) : null}
            <StyledButton
              label={'Add'}
              sx={{ my: 0.5, marginTop: '53px' }}
              variant="contained"
              aria-label="accept"
              disabled={!remoteUrlValue}
              onClick={() => onAddRemoteConfirm(remoteUrlValue)}
            />
          </Box>
        </CustomTabPanel>
      </DialogContent>
    </Dialog>
  )
}

const StyledButton = styled(SimpleButton)({
  boxShadow: 'none',
  width: '100%',
  textTransform: 'none',
  borderRadius: '9px',
  fontSize: 14,
  fontWeight: 700,
  padding: '14px 24px',
  lineHeight: 1.5,
  backgroundColor: 'black',
  '&:hover': {
    backgroundColor: 'gray',
  },
  '&:active': {
    boxShadow: 'none',
    backgroundColor: 'gray',
  },
  '&:focus': {
    boxShadow: '0 0 0 0 rgba(0,123,255,.5)',
  },
})

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
  color: '#717879',
  fontSize: '14px',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  '& input': {
    position: 'absolute',
    height: '100%',
    width: '100%',
    opacity: 0,
  },
}))

const StyledSelectBox = styled(Box)(() => ({
  marginTop: '28px',
  backgroundColor: '#FAFAFA',
  padding: '4px 10px',
  borderRadius: '4px',
  border: '0.5px solid #D3D7D8',
  boxShadow: '0px 0px 0px 0px rgba(0, 0, 0, 0.25)',
  '& span': {
    backgroundColor: '#4C5564',
    fontSize: '12px',
    padding: '2px 4px',
    borderRadius: '2px',
    lineHeight: 1,
    color: 'white',
    marginLeft: '4px',
  },
}))

const StyledTextField = styled(TextField)(() => ({
  marginTop: '8px',
  fontSize: '14px',
  '& label.Mui-focused': {
    color: '#00D1FF',
  },
  '& .MuiInput-underline:after': {
    borderBottomColor: '#00D1FF',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'gray',
    },
    '&:hover fieldset': {
      borderColor: '#00D1FF',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#00D1FF',
    },
  },
}))
