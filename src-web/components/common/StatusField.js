/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* Copyright (c) 2020 Red Hat, Inc. */
/* Copyright Contributors to the Open Cluster Management project */


import React from 'react'
import PropTypes from 'prop-types'
import {
  GreenCheckCircleIcon,
  YellowExclamationTriangleIcon,
  RedExclamationCircleIcon
} from './Icons'

class StatusField extends React.PureComponent {
  static propTypes = {
    status: PropTypes.oneOf(['ok', 'warning', 'failed', 'critical', 'offline', 'unknown', 'nostatus', 'invalid', 'compliant', 'noncompliant']),
    text: PropTypes.string
  }

  render() {
    let IconName
    const status = this.props.status
    const className = status
    switch (status) {
    case 'ok':
    case 'compliant':
      IconName = GreenCheckCircleIcon
      break
    case 'failed':
    case 'critical':
    case 'noncompliant':
      IconName = RedExclamationCircleIcon
      break
    case 'warning':
    case 'offline':
    case 'invalid':
    case 'unknown':
    case 'nostatus':
    default :
      IconName = YellowExclamationTriangleIcon
      break
    }
    return (
      <span className='table-status-row'>
        <span className={`table-status-icon table-status-icon__${className}`}>
          {<IconName /> }
        </span>
        <span className='table-status-label'>{this.props.text}</span>
      </span>
    )
  }
}

export default StatusField
