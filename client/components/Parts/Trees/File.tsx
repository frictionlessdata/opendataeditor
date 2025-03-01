import { fileMenuWidth } from '@client/components/Application/Layout'
import * as store from '@client/store'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import Box from '@mui/material/Box'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import { alpha, styled, useTheme } from '@mui/material/styles'
import { keyframes } from '@mui/system'
import { TreeItem, TreeItemProps, TreeView, treeItemClasses } from '@mui/x-tree-view'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import closedFolderIcon from '../../../assets/closed_folder_icon.svg'
import DeleteIcon from '../Icons/DeleteIcon'
import openFileLocationIcon from '../../../assets/open_file_location_icon.svg'
import openFolderIcon from '../../../assets/open_folder_icon.svg'
import renameIcon from '../../../assets/rename_icon.svg'
import * as helpers from '../../../helpers'
import * as types from '../../../types'
import IconButton from '../../Parts/Buttons/Icon'
import ScrollBox from '../Boxes/Scroll'

export interface FileTreeProps {
  files: types.IFile[]
  event?: types.IEvent
  selected?: string
  onSelect: (paths: string) => void
  defaultExpanded?: string[]
}

const Context = React.createContext<{
  event?: FileTreeProps['event']
}>({})

export default function FileTree(props: FileTreeProps) {
  const fileTree = React.useMemo(() => helpers.createFileTree(props.files), [props.files])
  const [expanded, setExpanded] = React.useState<string[]>([])
  React.useEffect(() => {
    const defaultExpanded = props.event
      ? helpers.listParentFolders(props.event.paths)
      : props.defaultExpanded || []
    setExpanded([...new Set([...expanded, ...defaultExpanded])])
  }, [props.event, props.defaultExpanded])

  const selected = props.selected || ''

  return (
    <Context.Provider value={{ event: props.event }}>
      <ScrollBox sx={{ padding: 0, height: '100%', overflowX: 'hidden' }}>
        <Stack alignItems="stretch" height="100%">
          <TreeView
            selected={selected}
            expanded={expanded}
            onNodeSelect={(_event, nodeIds) => props.onSelect(nodeIds as string)}
            onNodeToggle={(_event: React.SyntheticEvent, nodeIds: string[]) => {
              setExpanded(nodeIds)
            }}
            defaultCollapseIcon={<img src={openFolderIcon} alt="" />}
            defaultExpandIcon={<img src={closedFolderIcon} alt="" />}
            aria-label="customized"
          >
            {fileTree.map((item) => (
              <TreeNode item={item} key={item.path} />
            ))}
          </TreeView>
          <Box
            sx={{ flexGrow: 1, cursor: 'pointer' }}
            onClick={() => props.onSelect('')}
          ></Box>
        </Stack>
      </ScrollBox>
    </Context.Provider>
  )
}

function TreeNode(props: { item: types.IFileTreeItem }) {
  return (
    <StyledTreeItem key={props.item.path} nodeId={props.item.path} item={props.item}>
      {props.item.children.map((item) => (
        <TreeNode item={item} key={item.path} />
      ))}
    </StyledTreeItem>
  )
}

const StyledTreeItem = styled(
  (
    props: TreeItemProps & {
      item: types.IFileTreeItem
    }
  ) => {
    const { item, ...others } = props
    const { event } = React.useContext(Context)
    const animation =
      event &&
      event.paths.includes(props.nodeId) &&
      ['create', 'delete', 'update'].includes(event.type)
        ? `${fileEventKeyframe} 1s`
        : undefined

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
    const open = Boolean(anchorEl)
    const handleContextBtnClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget)
    }
    const handleClose = () => {
      setAnchorEl(null)
    }

    const handleDelete = () => {
      store.openDialog('deleteFilesFolders')
      handleClose()
    }

    const handleOpenFileLocation = (path: string) => {
      // @ts-ignore
      window?.opendataeditor?.openPathInExplorer(path)
      handleClose()
    }

    const handleRename = () => {
      store.openDialog('renameFile')
      handleClose()
    }

    const { t } = useTranslation()

    const fileOrFolder = item.type === 'folder' ? t('folder') : t('file')

    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}
      >
        <TreeItem
          {...others}
          endIcon={item.type === 'folder' ? <img src={closedFolderIcon} alt="" /> : null}
          className={item.type === 'folder' ? 'type_folder' : 'type_file'}
          sx={{
            animation,
            '& .MuiTreeItem-content': {
              minWidth: '205px',
            },
            '&.type_folder > .MuiTreeItem-content': {
              padding: '0 24px',
            },
            '& > .MuiTreeItem-content .MuiTreeItem-iconContainer': {
              marginRight: 0,
            },
            '& > .MuiTreeItem-content .MuiTreeItem-label': {
              maxWidth: '172px',
            },
            '& > .MuiTreeItem-content:hover': {
              width: `${fileMenuWidth}px`,
            },
            '& > .MuiTreeItem-content.Mui-selected, & > .MuiTreeItem-content.Mui-selected.Mui-focused':
              {
                zIndex: 0,
                position: 'relative',
                width: `${fileMenuWidth}px`,
              },
            '& + button': {
              position: 'sticky',
              right: 0,
            },
          }}
          label={<TreeItemIcon nodeId={props.nodeId} item={item} />}
        />
        <IconButton
          sx={{
            width: '20px',
            alignItems: 'flex-start',
            maxHeight: '40px',
            '& .MuiButton-startIcon': {
              marginRight: 0,
            },
            '& .MuiButton-startIcon .MuiSvgIcon-root': {
              marginRight: 0,
            },
          }}
          id="file-context-menu-btn"
          onClick={handleContextBtnClick}
          color="OKFNCoolGray"
          Icon={MoreHorizIcon}
          aria-controls={open ? 'basic-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        />
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          onClick={async () => await store.selectFileWithoutOpening({ path: item.path })}
          MenuListProps={{
            'aria-labelledby': 'file-context-menu-btn',
          }}
        >
          <MenuItem onClick={() => handleRename()}>
            <ListItemIcon
              sx={{
                paddingTop: '6px',
                alignSelf: 'flex-start',
                minWidth: '24px',
                '& img': {
                  width: '20px',
                },
              }}
            >
              {<img src={renameIcon} alt="" />}
            </ListItemIcon>
            <ListItemText primary={t('rename')} />
          </MenuItem>
          <MenuItem onClick={() => handleOpenFileLocation(item.path)}>
            <ListItemIcon
              sx={{
                paddingTop: '6px',
                alignSelf: 'flex-start',
                minWidth: '24px',
                '& img': {
                  width: '20px',
                },
              }}
            >
              {<img src={openFileLocationIcon} alt="" />}
            </ListItemIcon>
            <ListItemText
              primary={t('open-fileorfolder-location', { fileOrFolder })}
              secondary={t('context-menu-openlocation-description', { fileOrFolder })}
            />
          </MenuItem>
          <MenuItem onClick={handleDelete}>
            <ListItemIcon
              sx={{
                paddingTop: '3px',
                alignSelf: 'flex-start',
                minWidth: '24px',
                '& svg': {
                  width: '22px'
                },
              }}
            >
              <DeleteIcon color="OKFNRed500" />
            </ListItemIcon>
            <ListItemText
              primaryTypographyProps={{
                color: (theme) => theme.palette.OKFNRed500.main,
              }}
              primary={`${t('delete-filefolder', { fileOrFolder })}`}
              secondary={t('context-menu-delete-description')}
            />
          </MenuItem>
        </Menu>
      </Box>
    )
  }
)(({ theme }) => ({
  [`& .${treeItemClasses.iconContainer}`]: {
    '& .close': {
      opacity: 0.3,
    },
  },
  [`& .${treeItemClasses.group}`]: {
    marginLeft: 15,
    paddingLeft: 18,
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
  },
}))

function TreeItemIcon(props: { nodeId: string; item: types.IFileTreeItem }) {
  const theme = useTheme()

  let color = 'gray'
  if (props.item.type === 'folder') color = 'primary'
  if (props.item.name)
    color = props.item.errors
      ? theme.palette.OKFNRed500.main
      : theme.palette.OKFNGreenBlue.main

  const fontWeight = 'normal'

  return (
    <Box
      sx={{
        py: 1,
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        '& div': { mr: 1 },
      }}
    >
      <div
        style={{
          height: '8px',
          width: '8px',
          minWidth: '8px',
          minHeight: '8px',
          backgroundColor: color,
          borderRadius: '50%',
        }}
      >
        {' '}
      </div>
      <span style={{ whiteSpace: 'nowrap', fontWeight }}>{props.item.label}</span>
    </Box>
  )
}

// TODO: use color from theme
const fileEventKeyframe = keyframes`
  from {
    background-color: yellow;
  }
  to {
    background-color: inherit;
  }
`
