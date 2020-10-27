/* Copyright (c) 2020 Red Hat, Inc. */
'use strict'

import classNames from 'classnames'
import React from 'react'
import purifyReactNode from './PurifyReactNode'
import PropTypes from 'prop-types'
import {
  EmptyState,
  EmptyStateVariant,
  EmptyStateIcon,
  Pagination,
  PaginationVariant,
  SearchInput,
  Title,
} from '@patternfly/react-core'
import {
  Table,
  TableHeader,
  TableBody,
  SortByDirection
} from '@patternfly/react-table'
import { SearchIcon } from '@patternfly/react-icons'
import resources from '../../../lib/shared/resources'
import moment from 'moment'
import {connect} from 'react-redux'
import { resourceActions } from './ResourceTableRowMenuItemActions'
import msgs from '../../../nls/platform.properties'
import _ from 'lodash'

resources(() => {
  require('../../../scss/pattern-fly-table.scss')
})

class PatternFlyTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      perPage: this.props.perPage,
      page: 1,
      rows: [],
      itemCount: 0,
      sortBy: this.props.sortBy,
      startIdx: 0,
      endIdx: this.props.perPage,
      searchValue: ''
    }
    this.tableActionResolver = this.tableActionResolver.bind(this)
  }
  static defaultProps = {
    pagination: true,
    perPage: 10,
    noResultMsg: 'No results found',
    searchable: true,
    searchPlaceholder: 'Find',
    sortBy: {}
  }
  static getDerivedStateFromProps(props, state) {
    const { searchValue, sortBy } = state
    let trimmedSearchValue = (typeof searchValue === 'string') ? searchValue.trim() : ''
    // also able to search truncated text
    trimmedSearchValue = trimmedSearchValue.split('...')[0]
    const { pagination, rows, searchable } = props
    // Helper function to return the string from the cell
    const parseCell = function (cell) {
      if (cell.title && cell.title.props && cell.title.props.timestamp) {
        return {
          timeStamp: cell.title.props.timestamp,
          fromNow: moment(cell.title.props.timestamp, 'YYYY-MM-DDTHH:mm:ssZ').fromNow().toString()
        }
      }
      if (typeof cell === 'object') {
        // get the pure text from table cell
        return purifyReactNode(cell.title)
      }
      return cell
    }
    // Filter the rows based on given searchValue from user
    const rowsFiltered = !searchable || trimmedSearchValue === ''
      ? [...rows]
      : rows.filter(row => {
        const cells = row.cells ? row.cells : row
        return cells.some(item => {
          let parsedCell = parseCell(item)
          parsedCell = (typeof parsedCell === 'string') ? parsedCell : parsedCell.fromNow
          return parsedCell.trim().toLowerCase().includes(trimmedSearchValue.toLowerCase())
        })
      })

    // Sort the rows based on sortBy prop (if it's not empty)
    const sortedRows = rowsFiltered
    if (Object.keys(sortBy).length !== 0) {
      sortedRows.sort((a, b) => {
        const acell = a.cells ? a.cells[sortBy.index] : a[sortBy.index]
        const bcell = b.cells ? b.cells[sortBy.index] : b[sortBy.index]
        let avalue, bvalue
        if (sortBy.direction === SortByDirection.asc) {
          avalue = parseCell(acell)
          bvalue = parseCell(bcell)
        } else {
          bvalue = parseCell(acell)
          avalue = parseCell(bcell)
        }
        avalue = (typeof avalue === 'string') ? avalue : avalue.timeStamp
        bvalue = (typeof bvalue === 'string') ? bvalue : bvalue.timeStamp
        if (avalue > bvalue) {
          return 1
        } else if (avalue < bvalue) {
          return -1
        }
        return 0
      })
    }
    // Return the filtered and sorted array
    return {
      rows: sortedRows.slice(state.startIdx, pagination ? state.endIdx : sortedRows.length),
      itemCount: sortedRows.length,
    }
  }

  handleSort = (_event, index, direction) => {
    this.setState({
      sortBy: {
        index,
        direction
      }
    })
  }
  handlePerPageSelect = (_evt, newPerPage, newPage, startIdx, endIdx) => {
    this.setState({
      perPage: newPerPage,
      page: newPage,
      startIdx,
      endIdx,
    })
  }
  handleSetPage = (_evt, newPage, perPage, startIdx, endIdx) => {
    this.setState({
      page: newPage,
      startIdx,
      endIdx
    })
  }
  handleSearch = (value) => {
    this.setState({
      searchValue: value
    })
  }
  tableActionResolver() {
    const { getResourceAction, resourceType, tableActions, rows} = this.props
    const { locale } = this.context
    const row = _.get(rows, ['0', '0', 'title', '_owner', 'stateNode', 'props', 'grcItems', '0'])
    const filteredActions = []
    if (_.get(row, 'raw.spec.disabled', false)) {
      tableActions[tableActions.indexOf('table.actions.disable')] = 'table.actions.enable'
    }
    if (_.get(row, 'raw.spec.remediationAction', 'inform') === 'enforce') {
      tableActions[tableActions.indexOf('table.actions.enforce', locale)] = 'table.actions.inform'
    }
    if (Array.isArray(tableActions) && tableActions.length > 0) {
      tableActions.forEach((action) => {
        filteredActions.push(
          {
            title: msgs.get(action, locale),
            onClick: () =>
              getResourceAction(action, row, resourceType)
          }
        )
      })
    }
    return filteredActions
  }
  render() {
    const { sortBy, rows = [], itemCount, searchValue } = this.state
    const {
      columns,
      className,
      noResultMsg,
      pagination,
      searchable,
      searchPlaceholder,
      areActionsDisabled,
      dropdownPosition,
      dropdownDirection,
    } = this.props
    const classes = classNames('pattern-fly-table', className)
    return (
      <div className='pattern-fly-table-group'>
        {searchable && <SearchInput
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={this.handleSearch}
          onClear={() => this.handleSearch('')}
        />}
        <div className={classes}>
          <Table
            aria-label='Sortable Table'
            sortBy={sortBy}
            onSort={this.handleSort}
            cells={columns}
            rows={rows}
            actionResolver={this.tableActionResolver}
            areActionsDisabled={areActionsDisabled}
            dropdownPosition={dropdownPosition}
            dropdownDirection={dropdownDirection}
          >
            <TableHeader className='pattern-fly-table-header' />
            <TableBody className='pattern-fly-table-body' />
          </Table>
          {rows.length === 0 && (
            <EmptyState className='pattern-fly-table-empty-state' variant={EmptyStateVariant.small}>
              <EmptyStateIcon icon={SearchIcon} />
              <Title headingLevel='h2' size='md'>
                {noResultMsg}
              </Title>
            </EmptyState>
          )}
          {pagination && <Pagination
            itemCount={itemCount}
            widgetId='pagination-options-menu-bottom'
            perPage={this.state.perPage}
            page={this.state.page}
            variant={PaginationVariant.bottom}
            onSetPage={this.handleSetPage}
            onPerPageSelect={this.handlePerPageSelect}
            perPageOptions={[
              { title: '5', value: 5 },
              { title: '10', value: 10 },
              { title: '20', value: 20 },
              { title: '50', value: 50 },
            ]}
          />}
        </div>
      </div>
    )
  }
}

PatternFlyTable.propTypes = {
  /* Specifies if the Kebab for actions is disabled (optional) */
  areActionsDisabled: PropTypes.bool,
  /* Add class names in addition to the defaults to the PatternFly table (optional) */
  className: PropTypes.string,
  /* Table column headings and properties */
  columns: PropTypes.array,
  /* The desired direction to show the dropdown when clicking on the actions Kebab.
  Can only be used together with `actions` property (optional) */
  dropdownDirection: PropTypes.string,
  /* The desired position to show the dropdown when clicking on the actions Kebab.
  Can only be used together with `actions` property (optional) */
  dropdownPosition: PropTypes.string,
  getResourceAction: PropTypes.func,
  /* Message when no results are displayed in the table */
  noResultMsg: PropTypes.string,
  /* Toggle pagination (optional) */
  pagination: PropTypes.bool,
  /* Number of rows displayed per page for pagination */
  perPage: PropTypes.oneOf([5, 10, 20, 50]),
  resourceType: PropTypes.object,
  /* Table row content */
  rows: PropTypes.array,
  /* Placeholder text for search input field */
  searchPlaceholder: PropTypes.string,
  /* Toggle search input (optional) */
  searchable: PropTypes.bool,
  /* Initial table sorting (optional) */
  sortBy: PropTypes.shape({
    index: PropTypes.number,
    direction: PropTypes.oneOf(['asc', 'desc']),
  }),
  /* Available table actions (optional) */
  tableActions: PropTypes.array
}

const mapDispatchToProps = (dispatch) => {
  return {
    getResourceAction: (action, resource, resourceType) =>
      resourceActions(action, dispatch, resourceType, resource)
  }
}

export default connect(null, mapDispatchToProps)(PatternFlyTable)
