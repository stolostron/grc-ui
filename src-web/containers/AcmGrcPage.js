/* eslint-disable react/prop-types */
/* Copyright (c) 2021 Red Hat, Inc. */
/* Copyright Contributors to the Open Cluster Management project */

'use strict'

import React from 'react'
import { useQuery } from '@apollo/client'
import { AcmPageContent, AcmPageHeader, AcmAutoRefreshSelect, AcmRefreshTime, AcmSecondaryNav, AcmAlert } from '@open-cluster-management/ui-components'
import { Spinner } from '@patternfly/react-core'
import { useHistory, useParams } from 'react-router-dom'

import { INITIAL_POLL_INTERVAL, REFRESH_INTERVALS, REFRESH_INTERVAL_COOKIE } from '../utils/constants'
import { getPageDefinition } from './definitions/PageDefinitions'

let timestamp = new Date().toString()

function AcmGrcPage(props) {
  const allProps = {...props, ...useParams(), history: useHistory()}
  const page = getPageDefinition(allProps)
  const { loading, data={}, refetch, error, previousData } = useQuery(page.query, { variables: page.query_variables, notifyOnNetworkStatusChange: true })
  const { items } = data
  if (!loading) {
    timestamp = new Date().toString()
  }
  return (
    <React.Fragment>
      <AcmPageHeader title={page.title}
        breadcrumb={page.breadcrumb}
        navigation={page.navigation && (
          <AcmSecondaryNav>
            {page.navigation.map(nav => nav(allProps))}
          </AcmSecondaryNav>
        )}
        controls={
          <React.Fragment>
            {page.refreshControls && (
              <React.Fragment>
                <AcmAutoRefreshSelect refetch={refetch}
                  refreshIntervals={REFRESH_INTERVALS}
                  refreshIntervalCookie={REFRESH_INTERVAL_COOKIE}
                  initPollInterval={INITIAL_POLL_INTERVAL} />
                <AcmRefreshTime timestamp={timestamp} reloading={loading} />
              </React.Fragment>
            )}
            <div className='page-header-button-group'>
            {page.buttons && (
              page.buttons.map(btn => btn(allProps))
            )}
            </div>
          </React.Fragment>}>
      </AcmPageHeader>
      <AcmPageContent id={page.id}>
        {(() => {
          if (error) {
            // Handle Apollo networkError type
            let eHeader
            const eMsg = []
            if (error.networkError) {
              const { statusCode='', bodyText='', message='', result='' } = error.networkError
              eHeader = <p key='eHeader'>Network Error {statusCode}</p>
              eMsg.push(<p key='eBodyText'>{bodyText}</p>)
              eMsg.push(<p key='eMessage'>{message}</p>)
              if (result.errors) {
                eMsg.push(<p key='eMsgDetails'>{result.errors.map((e) => e.message).join(';')}</p>)
              }
            // Handle Apollo graphQLErrors type
            } else {
              eHeader = <p key='eHeader'>GraphQL Error</p>
              eMsg.push(<p key='eMessage'>{error.errors.map((e) => e.message).join(';')}</p>)
            }
            return <AcmAlert isInline={true} noClose={true} variant='danger'
              title={eHeader} subtitle={eMsg} />
          }
          if (loading && !previousData || items === undefined ) {
            return <Spinner className='patternfly-spinner' />
          } else {
            return page.children({ items })
          }
        })()}
      </AcmPageContent>
    </React.Fragment>
  )
}

export default AcmGrcPage
