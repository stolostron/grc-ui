/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************
/* Copyright (c) 2020 Red Hat, Inc. */
'use strict'

import React from 'react'
import PropTypes from 'prop-types'
import resources from '../../lib/shared/resources'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { updateResourceToolbar, updateActiveFilters } from '../actions/common'
import { Loading, Notification } from 'carbon-components-react'
import { GRC_VIEW_STATE_COOKIE, GRC_FILTER_STATE_COOKIE } from '../../lib/shared/constants'
// eslint-disable-next-line import/no-named-as-default
import GrcCardsModule from './modules/GrcCardsModule'
// eslint-disable-next-line import/no-named-as-default
import GrcToggleModule from './modules/GrcToggleModule'
import {
  filterPolicies, filterFindings, getSavedGrcState, saveGrcState, replaceGrcState,
  saveGrcStatePair, updateWholeFilters,
} from '../../lib/client/filter-helper'
import { showResourceToolbar, hideResourceToolbar } from '../../lib/client/resource-helper'
import NoResource from './common/NoResource'
import createDocLink from './common/CreateDocLink'
import ResourceFilterBar from './common/ResourceFilterBar'
import msgs from '../../nls/platform.properties'
import _ from 'lodash'
import queryString from 'query-string'
import config from '../../lib/shared/config'
import memoize from 'memoize-one'

resources(() => {
  require('../../scss/grc-view.scss')
})

export class GrcView extends React.Component {

  constructor (props) {
    super(props)
    this.state= {
      viewState: getSavedGrcState(GRC_VIEW_STATE_COOKIE)
    }
    this.scroll = _.debounce(()=>{
      this.scrollView()
    }, 50)
    this.onUnload = this.onUnload.bind(this)
    window.addEventListener('beforeunload', this.onUnload)
    this.handleCreatePolicy = this.handleCreatePolicy.bind(this)
    this.updateViewState = this.updateViewState.bind(this)
    this.handleDrillDownClickGrcView = this.handleDrillDownClickGrcView.bind(this)
  }

  componentDidMount() {
    const {
      activeFilters={},
      grcItems,
      refreshControl,
      updateActiveFilters:localUpdateActiveFilters,
      updateResourceToolbar:localUpdateResourceToolbar
    } = this.props
    const { locale } = this.context
    const displayType = location.pathname.split('/').pop()
    const memoizedUpdateWholeFilters = memoize(updateWholeFilters)
    memoizedUpdateWholeFilters(activeFilters, grcItems, displayType, locale,
      localUpdateResourceToolbar, localUpdateActiveFilters, refreshControl)
    window.addEventListener('scroll', this.scroll)
  }

  searchFocus = (locationSearch) => {
    const urlParams = queryString.parse(locationSearch)
    if (urlParams.autoFocus && document.getElementsByClassName(urlParams.autoFocus)[0]) {
      const ref = document.getElementsByClassName(urlParams.autoFocus)[0].offsetTop
      window.scrollTo({
        top: ref,
      })
    }
  }

  componentDidUpdate(prevProps) {
    const {
      activeFilters,
      refreshControl,
      grcItems,
      updateActiveFilters:localUpdateActiveFilters,
      updateResourceToolbar:localUpdateResourceToolbar
    } = this.props
    if (!_.isEqual(refreshControl, prevProps.refreshControl) ||
        !_.isEqual(grcItems, prevProps.grcItems)) {
      const { locale } = this.context
      const displayType = location.pathname.split('/').pop()
      //if url has severity special para, store it into sessionStorage before updating active filters
      const urlParams = queryString.parse(location.search)
      if (urlParams.severity) {
        saveGrcStatePair(GRC_FILTER_STATE_COOKIE, 'severity', urlParams.severity)
      }
      const memoizedUpdateWholeFilters = memoize(updateWholeFilters)
      memoizedUpdateWholeFilters(activeFilters, grcItems, displayType, locale,
        localUpdateResourceToolbar, localUpdateActiveFilters, refreshControl)
    }
    const memoizedSearchFocus = memoize(this.searchFocus)
    memoizedSearchFocus(location.search)
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.scroll)
    window.removeEventListener('beforeunload', this.onUnload)
    this.onUnload()
  }

  render() {
    const { locale } = this.context
    const showApplications = this.props.showApplications
    const { viewState } = this.state
    const { loading, error, grcItems, applications, activeFilters={}, secondaryHeaderProps, refreshControl, location } = this.props
    hideResourceToolbar()
    if (loading) {
      return <Loading withOverlay={false} className='content-spinner' />
    }

    if (error) {
      if (error.name === 'PermissionError') {
        return <Notification title='' className='overview-notification' kind='error'
          subtitle={msgs.get('error.permission.denied', locale)} />
      }
      return <Notification title='' className='overview-notification' kind='error'
        subtitle={msgs.get('overview.error.default', locale)} />
    }

    const displayType = location.pathname.split('/').pop()
    let filterGrcItems, filterToEmpty = false
    switch(displayType) {
    case 'all':
    default:
      if (!grcItems || grcItems.length === 0) {
        return (
          <NoResource
            title={msgs.get('no-resource.title', [msgs.get('routes.grc', locale)], locale)}
            detail={msgs.get('no-resource.detail.policy', locale)}>
            {createDocLink(locale, this.handleCreatePolicy, msgs.get('routes.create.policy', locale))}
          </NoResource>
        )
      }
      else {
        filterGrcItems = filterPolicies(grcItems, activeFilters, locale, 'metadata.annotations')
        if (grcItems.length > 0 && filterGrcItems.length === 0) {
          filterToEmpty = true
        }
      }
      break
    case 'findings':
      if (!grcItems || grcItems.length === 0) {
        return (
          <NoResource
            title={msgs.get('no-resource.title', [msgs.get('routes.grc', locale)], locale)}
            detail={msgs.get('no-resource.detail.item', locale)}>
            {createDocLink(locale, this.handleCreatePolicy, msgs.get('routes.create.policy', locale), false)}
          </NoResource>
        )
      }
      else {
        filterGrcItems = filterFindings(grcItems, activeFilters, locale)
        if (grcItems.length > 0 && filterGrcItems.length === 0) {
          filterToEmpty = true
        }
      }
      break
    }

    showResourceToolbar()
    const urlParams = queryString.parse(location.search)
    const showGrcCard = urlParams.card==='false' ? false : true
    const grcTabToggleIndex = urlParams.index ? Number(urlParams.index) : 0
    const showGrcTabToggle = urlParams.toggle==='false' ? false : true
    const highLightRowName = urlParams.name ? urlParams.name : ''
    const showSidePanel = urlParams.side==='true' ? true : false
    return (
      <div className='grc-view'>
        <ResourceFilterBar />
        <GrcCardsModule
          displayType={displayType}
          viewState={viewState}
          updateViewState={this.updateViewState}
          grcItems={filterGrcItems}
          activeFilters={activeFilters}
          showGrcCard={showGrcCard}
          handleDrillDownClick={this.handleDrillDownClickGrcView}
        />
        <GrcToggleModule
          displayType={displayType}
          refreshControl={refreshControl}
          grcItems={filterGrcItems}
          applications={applications}
          secondaryHeaderProps={secondaryHeaderProps}
          locale={locale}
          showApplications={showApplications}
          grcTabToggleIndex={grcTabToggleIndex}
          showGrcTabToggle={showGrcTabToggle}
          highLightRowName={highLightRowName}
          showSidePanel={showSidePanel}
          filterToEmpty={filterToEmpty}
          handleCreatePolicy={this.handleCreatePolicy} />
      </div>
    )
  }

  updateViewState(states) {
    this.setState(prevState=>{
      return {viewState:  Object.assign(prevState.viewState, states)}
    })
  }

  scrollView () {
    const headerRef = document.getElementsByClassName('secondary-header')[0]
    const contentRef = document.getElementsByClassName('grc-view')[0]
    if (headerRef && contentRef) {
      const contentRect = contentRef.getBoundingClientRect()
      headerRef.classList.toggle('bottom-border', contentRect.top<180)
    }
  }

  onUnload() {//saved grc view ui setting
    saveGrcState(GRC_VIEW_STATE_COOKIE, this.state.viewState)
  }

  handleDrillDownClickGrcView(key, value, type, level){
    //step 1 add activeFilters when click GrcCardsModule
    //here for severity level, will not update filter here but just update url
    //then acutally update it in componentWillReceiveProps()
    const {updateActiveFilters:localUpdateActiveFilters} = this.props
    //lodash recursively deep clone
    const activeFilters = _.cloneDeep(this.props.activeFilters||{})
    let activeSet
    if (value) { //add non-null grc-card filter
      //covert filter name on policy card to start case to match
      value = _.startCase(value.replace(' ', '-'))
      if (!activeFilters[key]) {
        activeFilters[key] = new Set()
      }
      activeSet = activeFilters[key]
      activeSet.add(value)
    }
    if (level) { //add non-null severity level filter
      if (!activeFilters[type]) {
        activeFilters[type] = new Set()
      }
      activeSet = activeFilters[type]
      activeSet.add(level)
    }
    if (activeSet && activeSet.size > 0 && replaceGrcState && localUpdateActiveFilters) {
      replaceGrcState(GRC_FILTER_STATE_COOKIE, activeFilters)
      localUpdateActiveFilters(activeFilters)
    }

    //step 2 update url when click GrcCardsModule
    const paraURL = {
      card: false,
      toggle: false,
    }
    type && type.toLowerCase()==='cluster' ? paraURL.index=1 : paraURL.index=0
    let urlString = queryString.stringify(paraURL)
    //also append GrcToggleModule search input filter to the end of url if existing
    const curentURL = queryString.parse(location.search)
    if(curentURL.filters && curentURL.filters!==''){
      urlString = `${urlString}&filters=${curentURL.filters}`}
    if (this.props.history) {
      this.props.history.push(`${this.props.location.pathname}?${urlString}`)}
    return urlString
  }

  handleCreatePolicy(){
    this.props.history.push(`${config.contextPath}/create`)
  }
}

GrcView.propTypes = {
  activeFilters: PropTypes.object,
  applications: PropTypes.array,
  error: PropTypes.object,
  grcItems: PropTypes.array,
  history: PropTypes.object.isRequired,
  loading: PropTypes.bool,
  location: PropTypes.object,
  refreshControl: PropTypes.object,
  secondaryHeaderProps: PropTypes.object,
  showApplications: PropTypes.bool,
  updateActiveFilters: PropTypes.func,
  updateResourceToolbar: PropTypes.func,
}

const mapStateToProps = (state) => {
  const {resourceToolbar: {activeFilters}} = state
  return { activeFilters }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateResourceToolbar: (refreshControl, availableFilters) => dispatch(updateResourceToolbar(refreshControl, availableFilters)),
    updateActiveFilters: (activeFilters) => dispatch(updateActiveFilters(activeFilters))
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(GrcView))
