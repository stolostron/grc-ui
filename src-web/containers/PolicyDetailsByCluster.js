/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018, 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* Copyright (c) 2020 Red Hat, Inc. */
'use strict'

import React from 'react'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { updateSecondaryHeader} from '../actions/common'
import {getPollInterval} from '../components/common/RefreshTimeSelect'
import _ from 'lodash'
import { GRC_REFRESH_INTERVAL_COOKIE, RESOURCE_TYPES } from '../../lib/shared/constants'
import msgs from '../../nls/platform.properties'
import { Query } from 'react-apollo'
import { POLICY_DETAILS_FOR_CLUSTER } from '../../lib/client/queries'
import { getResourceData } from '../tableDefinitions'
import PolicyClusterDetail from '../components/modules/PolicyClusterDetail'
import { setRefreshControl } from '../../lib/client/reactiveVars'

class PolicyDetailsByCluster extends React.Component {
  static propTypes = {
    location: PropTypes.object,
    params: PropTypes.object,
    resourceType: PropTypes.object,
    updateSecondaryHeader: PropTypes.func,
  }

  static defaultProps = {
    resourceType: RESOURCE_TYPES.POLICIES_BY_POLICY,
  }

  static contextTypes = {
    locale: PropTypes.string
  }

  constructor (props) {
    super(props)
  }

  UNSAFE_componentWillMount() {
    const { updateSecondaryHeader:localUpdateSecondaryHeader } = this.props
    localUpdateSecondaryHeader(this.getPolicyName(true), null, this.getBreadcrumb())
  }

  getPolicyName(withParentNamespace) {
    const { location } = this.props,
          urlSegments = location.pathname.split('/')
    if(withParentNamespace){
      return urlSegments[urlSegments.length - 1]
    }
    else{
      const nameSegments = urlSegments[urlSegments.length - 1].split('.')
      return nameSegments[1]
    }
  }

  getRootPolicyNamespace() {
    const { location } = this.props,
          urlSegments = location.pathname.split('/'),
          nameSegments = urlSegments[urlSegments.length - 1].split('.')
    return nameSegments[0]
  }

  getClusterName() {
    const { location } = this.props,
          urlSegments = location.pathname.split('/')
    return urlSegments[urlSegments.length - 2]
  }

  getBreadcrumb() {
    const breadcrumbItems = []
    const {  location, resourceType } = this.props,
          { locale } = this.context,
          urlSegments = location.pathname.split('/')

    // Push only one breadcrumb to overview page
    if (resourceType.name === RESOURCE_TYPES.POLICIES_BY_POLICY.name) {
      breadcrumbItems.push({
        label: msgs.get('tabs.hcmcompliance', locale),
        noLocale: true,
        url: `${urlSegments.slice(0, 3).join('/')}/all`
      },
      {
        label: this.getPolicyName(false),
        noLocale: true,
        url: `${urlSegments.slice(0, 3).join('/')}/all/${this.getRootPolicyNamespace()}/${this.getPolicyName(false)}`
      },
      {
        label: this.getClusterName(),
        noLocale: true,
        url: `${urlSegments.join('/')}`
      }
      )
    }
    return breadcrumbItems
  }

  render() {
    const url = _.get(this.props, 'location.pathname')
    const urlSegments = url.split('/')
    const policyName = urlSegments[urlSegments.length - 1]
    const policyNamespace = urlSegments[urlSegments.length - 2]
    const pollInterval = getPollInterval(GRC_REFRESH_INTERVAL_COOKIE)
    const {params, resourceType} = this.props
    const staticResourceData = getResourceData(resourceType)
    return (
      <Query query={POLICY_DETAILS_FOR_CLUSTER} variables={{name: policyName, clusterName: policyNamespace}} pollInterval={pollInterval} notifyOnNetworkStatusChange >
        {(result) => {
          const {data={}, loading, startPolling, stopPolling, refetch} = result
          const { policies } = data
          const error = policies ? null : result.error
          if (!loading) {
            this.timestamp = new Date().toString()
          }
          setRefreshControl(loading, this.timestamp, startPolling, stopPolling, refetch)

          return (
            <PolicyClusterDetail
              resourceType={resourceType}
              staticResourceData={staticResourceData}
              policies={policies}
              loading={!policies && loading}
              error={error}
              params={params}
            />)
        }}
      </Query>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateSecondaryHeader: (title, tabs, breadcrumbItems, links) => dispatch(updateSecondaryHeader(title, tabs, breadcrumbItems, links))
  }
}

export default withRouter(connect(null, mapDispatchToProps)(PolicyDetailsByCluster))
