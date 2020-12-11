
/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 * Copyright (c) 2020 Red Hat, Inc.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
'use strict'
import msgs from '../../../../../nls/platform.properties'
import _ from 'lodash'

export function validateYAML(parsed, controlData, exceptions, locale) {
  if (exceptions.length===0) {
    controlData.forEach(control=>{
      const {type, reverse, mustExist=false} = control
      if (reverse) {
        switch (type) {
        case 'text':
        case 'hidden':
          validateTextControl(reverse, parsed, exceptions, locale, mustExist)
          break
        case 'checkbox':
          validateCheckboxControl(control, reverse, parsed, exceptions, locale, mustExist)
          break
        case 'singleselect':
          validateSingleSelectControl(control, reverse, parsed, exceptions, locale, mustExist)
          break
        case 'multiselect':
          validateMultiSelectControl(control, reverse, parsed, exceptions, locale, mustExist)
        }
      }
    })
  }
}

const validateTextControl = (reverse, parsed, exceptions, locale, mustExist) => {
  // Add exception if it's required but missing
  if (mustExist && !_.get(parsed, reverse[0])) {
    addMissingException(reverse[0].split('.'), parsed, exceptions, locale)
  }
}

const validateSingleSelectControl =  (control, reverse, parsed, exceptions, locale, mustExist) => {
  const active = _.get(parsed, reverse[0])
  const path = reverse[0].split('.')
  // Add exception if it's required but missing
  if (mustExist && !active) {
    addMissingException(path, parsed, exceptions, locale)
  }
  // Add validation exception
  else if (active && _.indexOf(_.get(control, 'available'), active) === -1){
    const available = _.get(control, 'available', [])
    let choices
    // Truncate the list if it's over a certain number of values
    if (available.length > 5) {
      choices = available.slice(0, 5)
      choices.push('...')
    } else {
      choices = available
    }
    exceptions.push({
      row: getRow(path, parsed),
      column: 0,
      text: msgs.get('validation.bad.value', [getKey(path), choices], locale),
      type: 'error',
    })
  }
}

const validateCheckboxControl = (control, reverse, parsed, exceptions, locale, mustExist) => {
  const active = _.get(parsed, reverse[0])
  const path = reverse[0].split('.')
  const {available} = control
  // Add exception if it's required but missing
  if (mustExist && !active) {
    addMissingException(path, parsed, exceptions, locale)
  }
  // Add validation exception for blank or invalid entry (null is returned for blank entries)
  else if (active!==undefined && available.indexOf(active)===-1) {
    exceptions.push({
      row: getRow(path, parsed),
      column: 0,
      text: msgs.get('validation.bad.value', [getKey(path), available.join(', ')], locale),
      type: 'error',
    })
  }
}

const validateMultiSelectControl = (control, reverse, parsed, exceptions, locale, mustExist) => {
  const {hasLabels, hasReplacements} = control
  // Determine type of multiselect validation needed
  if (hasLabels) {
    validateMultiSelectLabelControl(control, reverse, parsed, exceptions, locale, mustExist)
  } else if (hasReplacements) {
    validateMultiSelectReplacementControl(control, reverse, parsed, exceptions, locale, mustExist)
  } else {
    validateTextControl(reverse, parsed, exceptions, locale, mustExist)
  }
}

const validateMultiSelectLabelControl = (control, reverse, parsed, exceptions, locale, mustExist) => {
  const matchLabels = _.get(parsed, `${reverse[0]}.matchLabels`)
  const matchExpressions = _.get(parsed, `${reverse[0]}.matchExpressions`)
  // Add exception if it's required but missing
  if (mustExist && !matchLabels && !matchExpressions) {
    const path = reverse[0].split('.')
    addMissingException(path, parsed, exceptions, locale)
  }
}

const validateMultiSelectReplacementControl = (control, reverse, parsed, exceptions, locale, mustExist) => {
  const hasOne = reverse.some(path=>{
    return !!_.get(parsed, path)
  })
  // Add exception if it's required but missing
  if (mustExist && !hasOne) {
    addMissingException(reverse[0].split('.'), parsed, exceptions, locale)
  }
}

const addMissingException = (path, parsed, exceptions, locale) => {
  let exceptionAdded = false
  do {
    const lastPop = path.pop()
    if (!!_.get(parsed, path.join('.')) || path.length<=1) {

      // create exception
      path.push(lastPop)
      exceptions.push({
        row: getRow(path, parsed),
        column: 0,
        text: msgs.get('validation.missing.resource', [getKey(path)], locale),
        type: 'error',
      })
      exceptionAdded=true
    }
  } while (!exceptionAdded)
}

const getKey = (path) => {
  return path.join('.').replace('.$raw', '').replace('[0]', '')
}

const getRow = (path, parsed) => {
  const pathBase = path.shift()
  path.shift()
  path = (path.length>0 ? pathBase + `.$synced.${path.join('.$v.')}` : pathBase).split('.')
  let synced
  do {
    synced = _.get(parsed, path.join('.'))
    path.pop()
  } while (path.length>0 && (synced===undefined || synced.$r===undefined))
  return synced ? synced.$r+1 : 0
}

