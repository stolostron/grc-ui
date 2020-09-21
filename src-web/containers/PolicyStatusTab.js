/* Copyright (c) 2020 Red Hat, Inc. */
'use strict'

import React from 'react'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import resources from '../../lib/shared/resources'
import { Spinner } from '@patternfly/react-core'
import {getPollInterval} from '../components/common/RefreshTimeSelect'
import { GRC_REFRESH_INTERVAL_COOKIE } from '../../lib/shared/constants'
import { Query } from 'react-apollo'
import { PolicyStatus } from '../../lib/client/queries'
import Page from '../components/common/Page'
import { DangerNotification } from '../components/common/DangerNotification'
import PolicyStatusView from '../components/common/PolicyStatusView'

resources(() => {
  require('../../scss/policy-status-tab.scss')
})

class PolicyStatusTab extends React.Component {
  static propTypes = {
    policyName: PropTypes.string,
    policyNamespace: PropTypes.string,
  }

  constructor (props) {
    super(props)
  }

  render() {
    const {
      policyName,
      policyNamespace:hubNamespace,
    } = this.props
    const pollInterval = getPollInterval(GRC_REFRESH_INTERVAL_COOKIE)
    return (
      <Query
        query={PolicyStatus}
        variables={{policyName, hubNamespace}}
        pollInterval={pollInterval}
        notifyOnNetworkStatusChange
      >
        {(result) => {
          const {data={}, loading, startPolling, stopPolling, refetch} = result
          const { status } = data
          const error = status ? null : result.error
          const firstLoad = this.firstLoad
          this.firstLoad = false
          const reloading = !firstLoad && loading
          const refreshControl = {
            reloading,
            refreshCookie: GRC_REFRESH_INTERVAL_COOKIE,
            startPolling, stopPolling, refetch,
            timestamp: this.timestamp
          }
          if (error) {
            return (
              <Page>
                <DangerNotification error={error} />
              </Page>
            )
          } else if (loading && status === undefined) {
            return <Spinner className='patternfly-spinner' />
          } else{
            if (pollInterval) {
              refreshControl.startPolling(pollInterval)
            }
            return (
              <Page>
                {<PolicyStatusView
                  status={status}
                />}
              </Page>
            )
          }
        }}
      </Query>
    )
  }
}

export default withRouter(PolicyStatusTab)
