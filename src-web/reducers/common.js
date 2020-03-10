/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 * Copyright (c) 2020 Red Hat, Inc.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/*
Since these selectors are common (i.e used across different components and different parts of the store)
we have to create unique selectors each invocation and the selectors need additional metata data sent
though props that indicate which part of the store it should select from.

//See https://github.com/reactjs/reselect#sharing-selectors-with-props-across-multiple-components
//See https://github.com/reactjs/reselect#q-can-i-share-a-selector-across-multiple-components

The selector pattern is an abstraction that standardizes an application’s store querying logic.
It is simple: for any part of the store that an application needs access to, define a function that
when given the full store, returns the desired part (or derivation) of the store.
*/

import { createSelector } from 'reselect'
import lodash from 'lodash'
import { normalize } from 'normalizr'
import ReactDOMServer from 'react-dom/server'
import * as Actions from '../actions'
import { createResourcesSchema } from '../../lib/client/resource-schema'
import { transform } from '../../lib/client/resource-helper'
import getResourceDefinitions, * as ResourceDefinitions from '../definitions'
import { RESOURCE_TYPES } from '../../lib/shared/constants'
import msgs from '../../nls/platform.properties'

function getFromState(state, root, attribute) {
  if(root && state) {
    const storeRoot = state[root]
    if (attribute && storeRoot && storeRoot[attribute]) {
      return storeRoot[attribute]
    }
  }
  return []
}

export const getItems = (state, props) => getFromState(state,props.storeRoot, 'items')
export const getItemsPerPage = (state, props) => getFromState(state,props.storeRoot, 'itemsPerPage')
export const getPage = (state, props) => getFromState(state,props.storeRoot, 'page')
export const getSearch = (state, props) => getFromState(state,props.storeRoot, 'search')
export const getSortColumn = (state, props) => getFromState(state,props.storeRoot, 'sortColumn')
export const getSortDirection = (state, props) => getFromState(state,props.storeRoot, 'sortDirection')


export const INITIAL_STATE = {
  items: [],
  itemsPerPage: Actions.PAGE_SIZES.DEFAULT,
  page: 1,
  search: '',
  sortColumn: undefined,
  sortDirection: Actions.SORT_DIRECTION_ASCENDING,
  status: Actions.REQUEST_STATUS.INCEPTION,
  patchStatus: undefined,
  patchErrorMsg: '',
  putStatus: undefined,
  putErrorMsg: '',
  postStatus: undefined,
  postStatusCode: undefined,
  postErrorMsg: '',
  pendingActions: [],
  clientSideFilters: undefined,
}

function searchTableCell(item, tableKey, context, searchText){
  const renderedElement = transform(item, tableKey, context.locale, true)
  if (typeof renderedElement === 'string') {
    return renderedElement.toLowerCase().indexOf(searchText.toLowerCase()) !== -1
  } else {
    return ReactDOMServer.renderToString(transform(item, tableKey, context.locale, true)).toString().toLowerCase().indexOf(searchText.toLowerCase()) !== -1
  }
}

function searchTableCellHelper(search, tableKeys, item, context) {
  const searchKey = search.substring(0, search.indexOf('='))
  const searchField = search.substring(search.indexOf('=')+1)

  if (searchKey === 'textsearch') {
    return tableKeys.find(tableKey => searchTableCell(item, tableKey, context, searchField.replace(/[{}]/g, '')))
  }
  const tableKey = tableKeys.find(tableKey => msgs.get(tableKey.msgKey, context.locale).toLowerCase() === searchKey.toLowerCase())
  if (!lodash.isEmpty(searchField)) {
    if (!searchField.includes('{')) {
      if (tableKey) {
        return searchTableCell(item, tableKey, context, searchField)
      }
    } else {
      let found = false
      const searchKeys = searchField.replace(/[{}]/g, '').split(',')
      if (searchKeys && tableKey) searchKeys.forEach(searchKey => {
        if (searchTableCell(item, tableKey, context, searchKey)) found = true
      })
      return found
    }
  }
  // return all results when user types cluster=
  if (searchField === '')
    return true

  // by default, search all fields
  return tableKeys.find(tableKey => searchTableCell(item, tableKey, context, search))
}

const makeGetFilteredItemsSelector = (resourceType) => {
  return createSelector(
    [getItems, getSearch],
    (items, search) => items.filter((item) => {
      if (lodash.isEmpty(search))
        return true

      const tableKeys = ResourceDefinitions.getTableKeys(resourceType)
      if(document.getElementById('context')) {
        const context = JSON.parse(document.getElementById('context').textContent)

        if (search.includes('},')) {
        // special case like status={healthy}, labels={cloud=IBM}
          let found = false
          const searchFields = search.replace('},', '}},').toLowerCase().split('},')
          searchFields.forEach(searchField => {
            if (searchTableCellHelper(searchField, tableKeys, item, context)) {
              found = true
            }
          })
          return found
        } else {
          return searchTableCellHelper(search, tableKeys, item, context)
        }
      }
    })
  )
}

const makeGetTransformedItemsSelector = (resourceType) => {
  return createSelector(
    [makeGetFilteredItemsSelector(resourceType)],
    (items) => {
      const resourceData = getResourceDefinitions(resourceType)
      return items.map(item => {
        if(document) {
          const customData = {}
          if(document.getElementById('context')) {
            const context = JSON.parse(document.getElementById('context').textContent)
            resourceData.tableKeys.forEach(key => {
              if (key.transformFunction && typeof key.transformFunction === 'function') {
                customData[key.resourceKey.replace('custom.', '')] = key.transformFunction(item, context.locale)
              }
            })
          }
          item.custom = customData
        }
        return item
      })
    }
  )
}

//TODO could we do better? - we have one selector thus one cache for sorting.
//Thus if the sort direction change is toggled back we re-calculate.
const makeGetSortedItemsSelector = (resourceType) => {
  return createSelector(
    [makeGetTransformedItemsSelector(resourceType), getSortColumn, getSortDirection],
    (items, sortColumn, sortDirection) => {
      const initialSortField = sortColumn ? sortColumn : ResourceDefinitions.getDefaultSortField(resourceType)
      const sortField = initialSortField === 'custom.age' ? 'metadata.creationTimestamp' : initialSortField // sort by the actual date, not formatted value
      const sortDir = sortField === 'metadata.creationTimestamp' ? (sortDirection === Actions.SORT_DIRECTION_ASCENDING ? Actions.SORT_DIRECTION_DESCENDING : Actions.SORT_DIRECTION_ASCENDING) : sortDirection // date fields should initially sort from latest to oldest
      return lodash.orderBy(items, item => lodash.get(item, sortField), [sortDir])
    }
  )
}

const makeGetPagedItemsSelector = (resourceType) => {
  return createSelector(
    [makeGetSortedItemsSelector(resourceType), getPage, getItemsPerPage],
    (items, page, itemsPerPage) => {
      const offset = (page - 1) * itemsPerPage
      let lastIndex = offset + itemsPerPage
      lastIndex = lastIndex <= items.length ? lastIndex : items.length
      return {
        items: items.slice(offset, lastIndex),
        totalResults: items.length,
        totalPages: Math.ceil(items.length / itemsPerPage)
      }
    }
  )
}

export const makeGetVisibleTableItemsSelector = (resourceType) => {
  const pk = ResourceDefinitions.getPrimaryKey(resourceType)
  const sk = ResourceDefinitions.getSecondaryKey(resourceType)
  return createSelector(
    [makeGetPagedItemsSelector(resourceType)],
    result => {
      const normalizedItems = normalize(result.items, [createResourcesSchema(pk, sk)]).entities.items
      return Object.assign(result, {
        normalizedItems: normalizedItems,
        items: result.items.map(item => sk ? `${lodash.get(item, pk)}-${lodash.get(item, sk)}`:`${lodash.get(item, pk)}`) // to support multi cluster, use ${name}-${cluster} as unique id
      })
    }
  )
}

const getItemProps= (state, props) => props

export const getSingleResourceItem = createSelector(
  [getItems, getItemProps],
  (items, props) => items && items.length > 0 && props.predicate(items, props)
)

export const resourceItemByName = (items, props) => {
  const key = ResourceDefinitions.getURIKey(props.resourceType)
  return lodash.find(items, item =>
    lodash.get(item, key) === props.name
  )
}

export const resourceToolbar = (state = {}, action) => {
  switch (action.type) {
  case Actions.ACTIVE_FILTER_UPDATE:
    return Object.assign({}, state, {
      activeFilters: action.activeFilters,
    })
  case Actions.RESOURCE_TOOLBAR_UPDATE:
    return Object.assign({}, state, {
      refreshControl: action.refreshControl,
      availableFilters: action.availableFilters,
    })
  default:
    return state
  }
}

export const secondaryHeader = (state = {title: '', tabs: [], breadcrumbItems: [], links: [], description: {}, information:{}}, action) => {
  switch (action.type) {
  case Actions.SECONDARY_HEADER_UPDATE:
    return Object.assign({}, state, {
      title: action.title,
      tabs: action.tabs,
      breadcrumbItems: action.breadcrumbItems,
      links: action.links,
      description: action.description,
      information: action.information
    })
  default:
    return state
  }
}


export const resourceReducerFunction = (state = INITIAL_STATE, action) => {
  let items,index
  switch (action.type) {
  case Actions.RESOURCE_REQUEST:
    return Object.assign({}, state, {
      status: Actions.REQUEST_STATUS.IN_PROGRESS
    })
  case Actions.RESOURCE_RECEIVE_SUCCESS:
    return Object.assign({}, state, {
      status: Actions.REQUEST_STATUS.DONE,
      items: action.items,
      page: action.items.length === 0 ? 1 : action.items.length > state.itemsPerPage * (state.page - 1) ? state.page : state.page - 1,
      resourceVersion: action.resourceVersion
    })
  case Actions.RESOURCE_RECEIVE_FAILURE:
    return Object.assign({}, state, {
      status: Actions.REQUEST_STATUS.ERROR,
      err: action.err
    })
  case Actions.POST_REQUEST:
    return Object.assign({}, state, {
      postStatus: Actions.REQUEST_STATUS.IN_PROGRESS
    })
  case Actions.POST_RECEIVE_SUCCESS:
    items = state.items.slice(0)
    if (action.item.length > 0) { // if returned as an array due to making async calls, push action.item elements to the items array
      action.item.forEach(el => {
        items.push(el)
      })
    } else {
      items.push(action.item)
    }
    return Object.assign({}, state, {
      items: items,
      postStatus: Actions.REQUEST_STATUS.DONE
    })
  case Actions.POST_RECEIVE_FAILURE:
    return Object.assign({}, state, {
      postStatus: Actions.REQUEST_STATUS.ERROR,
      postStatusCode: action.err.error && action.err.error.response && action.err.error.response.status,
      postErrorMsg: action.err.error && action.err.error.message
    })
  case Actions.PUT_REQUEST:
    return Object.assign({}, state, {
      putStatus: Actions.REQUEST_STATUS.IN_PROGRESS
    })
  case Actions.PUT_RECEIVE_SUCCESS:
    return Object.assign({}, state, {
      putStatus: Actions.REQUEST_STATUS.DONE,
    })
  case Actions.PUT_RECEIVE_FAILURE:
    return Object.assign({}, state, {
      putStatus: Actions.REQUEST_STATUS.ERROR,
      putErrorMsg: action.err.error ? action.err.error.message : action.err.message
    })
  case Actions.PATCH_REQUEST:
    return Object.assign({}, state, {
      patchStatus: Actions.REQUEST_STATUS.IN_PROGRESS
    })
  case Actions.PATCH_RECEIVE_SUCCESS:
    return Object.assign({}, state, {
      patchStatus: Actions.REQUEST_STATUS.DONE,
    })
  case Actions.PATCH_RECEIVE_FAILURE:
    return Object.assign({}, state, {
      patchStatus: Actions.REQUEST_STATUS.ERROR,
      patchErrorMsg: action.err.error ? action.err.error.message : action.err.message
    })
  case Actions.CLEAR_REQUEST_STATUS:
    return Object.assign({}, state, {
      mutateStatus: undefined,
      mutateErrorMsg: undefined,
      postStatus: undefined,
      postStatusCode: undefined,
      postErrorMsg: undefined,
      putStatus: undefined,
      putErrorMsg: undefined,
      patchStatus: undefined,
      patchErrorMsg: undefined
    })
  case Actions.TABLE_SEARCH:
    return Object.assign({}, state, {
      search: action.search,
      page: 1
    })
  case Actions.TABLE_SORT:
    return Object.assign({}, state, {
      sortDirection: action.sortDirection,
      sortColumn: action.sortColumn
    })
  case Actions.TABLE_PAGE_CHANGE:
    return Object.assign({}, state, {
      page: action.page,
      itemsPerPage: action.pageSize
    })
  case Actions.RESOURCE_ADD: /* eslint-disable no-case-declarations */
  case Actions.RESOURCE_MODIFY:
    const resourceTypeObj = !lodash.isObject(action.resourceType) ? RESOURCE_TYPES[lodash.findKey(RESOURCE_TYPES, { name: action.resourceType })] : action.resourceType
    const primaryKey = ResourceDefinitions.getPrimaryKey(resourceTypeObj)
    items = state.items.slice(0)
    index = lodash.findIndex(items, o => (lodash.get(o, primaryKey) === lodash.get(action.item, primaryKey)))
    index > -1 ? items.splice(index, 1, action.item) : items.push(action.item)
    return Object.assign({}, state, {
      items: items
    })
  case Actions.RESOURCE_MUTATE:
    return Object.assign({}, state, {
      mutateStatus: Actions.REQUEST_STATUS.IN_PROGRESS,
      mutateErrorMsg: null,
      pendingActions: [...state.pendingActions, { name: action.resourceName, action: Actions.RESOURCE_MUTATE }]
    })
  case Actions.RESOURCE_MUTATE_FAILURE:
    return Object.assign({}, state, {
      mutateStatus: Actions.REQUEST_STATUS.ERROR,
      mutateErrorMsg: action.err.message || action.err.error && (action.err.error.message ||
        (action.err.error.data && action.err.error.data.Message)),
      pendingActions: state.pendingActions.filter(r => r && r.name !== action.resourceName),
    })
  case Actions.RESOURCE_MUTATE_SUCCESS:
    return Object.assign({}, state, {
      mutateStatus: Actions.REQUEST_STATUS.DONE,
      pendingActions: state.pendingActions.filter(r => r && r.name !== action.resourceName),
    })
  case Actions.RESOURCE_DELETE:
    items = [...state.items]
    index = lodash.findIndex(items, o => lodash.get(o, 'metadata.uid') === lodash.get(action, 'item.metadata.uid'))
    if(index > -1) {
      items.splice(index, 1)
      return Object.assign({}, state, {
        items: items
      })
    }
    return state
  case Actions.DEL_RECEIVE_SUCCESS:
    items = [...state.items]
    switch (action.resourceType) {
    case RESOURCE_TYPES.HCM_COMPLIANCES:
    case RESOURCE_TYPES.HCM_POLICIES:
    case RESOURCE_TYPES.HCM_POLICIES_PER_POLICY:
      const policy = lodash.get(action, 'resource')
      index = lodash.findIndex(items, { 'name':policy.name, 'namespace':policy.namespace })
      break
    default:
      index = lodash.findIndex(items, o => lodash.get(o, 'Name') === lodash.get(action, 'resourceName'))
      break
    }
    if(index > -1) {
      items.splice(index, 1)
      return Object.assign({}, state, {
        items: items
      })
    }
    return state
  default:
    return state
  }
}

/**
 * A common higher order reducer for resources
 * Follows the Redux pattern described here: http://redux.js.org/docs/recipes/reducers/ReusingReducerLogic.html#customizing-behavior-with-higher-order-reducers
 * **/
export const createResourceReducer = (reducerFunction, reducerPredicate) => {
  return (state, action) => {
    const isInitializationCall = state === undefined
    const shouldRunWrappedReducer = reducerPredicate(action) || isInitializationCall
    return shouldRunWrappedReducer ? reducerFunction(state, action) : state
  }
}
