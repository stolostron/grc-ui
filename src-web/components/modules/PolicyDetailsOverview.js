/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* Copyright (c) 2020 Red Hat, Inc. */
/* Copyright Contributors to the Open Cluster Management project */

'use strict'

import React from 'react'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { Alert } from '@patternfly/react-core'
import msgs from '../../nls/platform.properties'
import { AcmDescriptionList, AcmTable } from '@open-cluster-management/ui-components'
import NoResource from '../../components/common/NoResource'
import policyDetailsClusterListDef from '../../tableDefinitions/policyDetailsClusterListDef'
import policyDetailsOverviewDef from '../../tableDefinitions/policyDetailsOverviewDef'
import { transform_new, getPolicyCompliantStatus } from '../../tableDefinitions/utils'
import moment from 'moment'

import '../../scss/policy-details-overview.scss'

export class PolicyDetailsOverview extends React.PureComponent{
  constructor(props) {
    super(props)
  }

  static propTypes = {
    items: PropTypes.array,
    // location: PropTypes.object,
    // resourceType: PropTypes.object,
  }

  static contextTypes = {
    locale: PropTypes.string
  }

  render() {
    const {items=[]} = this.props
    if (items.length === 0) {
      return <NoResource
        title={msgs.get('error.not.found', [msgs.get('routes.grc', locale)], locale)}
        svgName='EmptyPagePlanet-illus.png'>
      </NoResource>
    } else if (items.length > 1) {
      console.error(`Only one policy was expected but ${items.length} were received. The other policies will be ignored.`)
    }
    const localItem = items[0]
    const { locale } = this.context
    const clusterList = transform_new([localItem], policyDetailsClusterListDef, locale)

    const modulesSecond = [
      <AcmTable
        key='cluster-list'
        className={'cluster-list'}
        items={clusterList.rows}
        columns={clusterList.columns}
        keyFn={(item) => item.uid.toString()}
        sortBy={clusterList.sortBy}
        gridBreakPoint=''
        autoHidePagination={true}
      />
    ]
    const itemPR = Array.isArray(localItem?.placementPolicies) && localItem.placementPolicies.length > 0
    const itemPB = Array.isArray(localItem?.placementBindings) && localItem.placementBindings.length > 0

    const descriptionItems = policyDetailsOverviewDef.rows.map((item) => {
      // AcmDescriptionList wants the items in {key: ..., value: ...} form
      const entry = {}
      if (Array.isArray(item.cells) && item.cells[0]) {
        const keyPath = item.cells[0].resourceKey || '-'
        entry.key = msgs.get(keyPath, locale)

        const entryData = item.cells[1] ? _.get(localItem, item.cells[1].resourceKey, '-') : '-'
        if (typeof(entryData) === 'object' || typeof(entryData) === 'boolean') {
          entry.value = JSON.stringify(entryData).replace(/\[|\]|"/g, ' ')
        } else {
          entry.value = entryData
        }
        if (item.cells[1].resourceKey) {
          if(item.cells[1].type === 'timestamp') {
            entry.value = moment(entry.value, 'YYYY-MM-DDTHH:mm:ssZ').fromNow()
          } else if(item.cells[1]?.resourceKey === 'clusterCompliant') {
            entry.value = getPolicyCompliantStatus({clusterCompliant: entry.value}, locale)
          }
        }
      }
      return entry
    })
    const itemsHalfCount = Math.ceil(descriptionItems.length / 2)

    return (
      <div className='overview-content'>
        <div className='vertical-expend'>
          <AcmDescriptionList
            title={msgs.get(policyDetailsOverviewDef.title, locale)}
            leftItems={descriptionItems.slice(0, itemsHalfCount)}
            rightItems={descriptionItems.slice(itemsHalfCount)}
          />
        </div>
        <div className='vertical-expend'>
          <h5 className='section-title'>{msgs.get('table.header.placement', locale)}</h5>
          {itemPR && itemPB
            ? modulesSecond
            : <Alert title={msgs.get('error.no.placement', locale)} isInline='true' />}
        </div>
      </div>
    )
  }
}

export default withRouter(PolicyDetailsOverview)
