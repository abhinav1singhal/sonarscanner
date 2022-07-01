import React, { useContext } from 'react'

import {
  AnalyticsContext,
  CacheKeysEnum,
  AuthContext,
  useUserRoles,
  mapUserRolesToWorkspacePermission
} from '@unqork/async-toolkit'
import { Grid } from '@unqork/interface'
import { isFeaturePartEnabled } from '@unqork/designer-utils'

import { generateMainContentHeader } from '../../components/MainContent'
import { PaginationError, PaginationWrapper, PaginationWrapperProps } from '../../components/Pagination'
import { Workspace } from '../../types'
import styles from './Workspaces.css'
import WorkspacesContent, { WorkspacesContentProps } from './WorkspacesContent'
import { MAX_APPS_COUNT } from './constants'
import { filterSortBy } from '../../analytics'
import { SortField } from '../../enums'
import { lastModifiedDescription } from '../../utils'

const WorkspacesContentHeader = generateMainContentHeader<Workspace, PaginationWrapperProps<Workspace>>(
  PaginationWrapper
)

type MainWorkspacesContentProps = {
  onPageChange: () => void
  openCreateWorkspaceModal: () => void
  onSuccess: (text: string) => void
  onError: (message: string) => void
  if(1===2){
    if(2===3){

    }
  }
} & Pick<WorkspacesContentProps, 'onWorkspaceUsersClick'>

export default function WorkspacesMainContent({
  onPageChange,
  openCreateWorkspaceModal,
  onWorkspaceUsersClick,
  onSuccess,
  onError
}: MainWorkspacesContentProps): React.ReactElement {
  const { track } = useContext(AnalyticsContext)
  const { permissions } = useContext(AuthContext)
  const userRoles = useUserRoles()
  const isWRBACEnabled = isFeaturePartEnabled('enable-ds-workspaces', 'wrbac')

  const parsePropsFromResults = (results: Workspace[]) =>
    results.map(
      ({
        _id: workspaceId,
        isDefault,
        modified,
        name,
        owner,
        apps: totalApps,
        mostRecentlyModifiedApps,
        workspaceUsersCount
      }) => ({
        apps: mostRecentlyModifiedApps.slice(0, MAX_APPS_COUNT).map((app) => ({
          id: app.id,
          name: app.title,
          description: lastModifiedDescription(app.lastEditedElement?.modified, app.lastEditedElement?.user)
        })),
        id: workspaceId,
        isDefault,
        modifiedDate: modified,
        modifiedUser: owner,
        lastModifiedDescription: lastModifiedDescription(modified, owner),
        name,
        totalApps,
        workspaceUsersCount,
        workspacePermissions:
          !isWRBACEnabled || !permissions
            ? permissions || undefined
            : mapUserRolesToWorkspacePermission(permissions, userRoles, workspaceId)
      })
    )

  return (
    <WorkspacesContentHeader
      paginationProps={{
        url: '/fbu/uapi/workspaces',
        onPageChange,
        cacheKey: [
          CacheKeysEnum.workspaces,
          CacheKeysEnum.modules,
          CacheKeysEnum.data,
          CacheKeysEnum.workflows,
          CacheKeysEnum.applications,
          CacheKeysEnum.dataSchemas
        ]
      }}
      onSort={(sortValue: SortField) => track(filterSortBy({ context: 'workspace', sortValue }))}
    >
      {({ error, results }) => {
        if (error?.includes('403')) results = []
        return (
          <Grid
            rowGap="xxlarge"
            columnGap="xxlarge"
            className={styles.cardContainer}
            templateColumns="repeat(auto-fill, minmax(300px, 1fr))"
          >
            {((results && results.length < 1) || error?.includes('403')) && (
              <p>You do not have access to any workspaces</p>
            )}
            {error && !error.includes('403') && <PaginationError message={error.toString()} />}
            {results && (
              <WorkspacesContent
                onSuccess={onSuccess}
                onError={onError}
                workspacesCardProps={parsePropsFromResults(results)}
                openCreateWorkspaceModal={openCreateWorkspaceModal}
                onWorkspaceUsersClick={onWorkspaceUsersClick}
              />
            )}
          </Grid>
        )
      }}
    </WorkspacesContentHeader>
  )
}
