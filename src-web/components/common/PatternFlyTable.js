/* Copyright (c) 2020 Red Hat, Inc. */
'use strict'

import classNames from 'classnames'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
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

resources(() => {
  require('../../../scss/pattern-fly-table.scss')
})

const colCompare = (aDict, bDict, sortBy) => {
  let a = aDict[sortBy.index].title ? aDict[sortBy.index].title : aDict[sortBy.index]
  let b = bDict[sortBy.index].title ? bDict[sortBy.index].title : bDict[sortBy.index]
  if (a.props && a.props.children && a.props.children.length === 3) {
    //for comparing status, since value is div
    a = a.props.children[2]
    b = b.props.children[2]
  }
  if ((typeof a !== 'string') || !(a.endsWith(' ago'))) {
    //not timestamp, sort normally
    return (a < b ? -1 : a > b ? 1 : 0)
  }
  //timestamp
  if (a == b) {
    return 0
  }
  const heirarchy = [
    'a few seconds ago',
    ' seconds ago',
    'a minute ago',
    ' minutes ago',
    'an hour ago',
    ' hours ago',
    'a day ago',
    ' days ago',
    'a month ago',
    ' months ago',
    'a year ago',
    ' years ago',
  ]
  let aIdx = -1
  let bIdx = -1
  for (let i = 0; i < heirarchy.length; i++) {
    const datestr = heirarchy[i]
    if (a.endsWith(datestr)) {
      aIdx = i
      break
    }
  }
  for (let i = 0; i < heirarchy.length; i++) {
    const datestr = heirarchy[i]
    if (b.endsWith(datestr)) {
      bIdx = i
      break
    }
  }
  if (aIdx < bIdx) {
    return -1
  }
  if (aIdx > bIdx) {
    return 1
  }
  if (aIdx == bIdx) {
    const aNum = a.split(' ')[0]
    const bNum = b.split(' ')[0]
    if (aNum < bNum) {
      return -1
    }
    if (aNum > bNum) {
      return 1
    }
  }
}

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
    const { pagination, rows, searchable } = props
    // Helper function to return the string from the cell
    const parseCell = function (cell) {
      if (typeof cell === 'object' && cell.title === 'string') {
        return cell.title
      } else if (typeof cell === 'object') {
        // It's not a string so render the component and strip HTML tags
        return ReactDOMServer.renderToString(cell.title).replace(/<[^>]+>/g, '')
      }
      return cell
    }
    // Filter the rows based on given searchValue from user
    const rowsFiltered = !searchable || searchValue === ''
      ? [...rows]
      : rows.filter(row => {
        const cells = row.cells ? row.cells : row
        return cells.some(item => {
          return parseCell(item).toLowerCase().includes(searchValue.toLowerCase())
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
        return colCompare(avalue, bvalue, sortBy)
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
  render() {
    const { sortBy, rows = [], itemCount, searchValue } = this.state
    const { columns, className, noResultMsg, pagination, searchable, searchPlaceholder } = this.props
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
          <Table aria-label='Sortable Table' sortBy={sortBy} onSort={this.handleSort} cells={columns}
            rows={rows}>
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
  /** Add class names in addition to the defaults to the PatternFly table (optional) */
  className: PropTypes.string,
  /** Table column headings and properties */
  columns: PropTypes.array,
  /** Message when no results are displayed in the table */
  noResultMsg: PropTypes.string,
  /** Toggle pagination (optional) */
  pagination: PropTypes.bool,
  /** Number of rows displayed per page for pagination */
  perPage: PropTypes.oneOf([5, 10, 20, 50]),
  /** Table row content */
  rows: PropTypes.array,
  /** Placeholder text for search input field */
  searchPlaceholder: PropTypes.string,
  /** Toggle search input (optional) */
  searchable: PropTypes.bool,
  /** Initial table sorting (optional) */
  sortBy: PropTypes.shape({
    index: PropTypes.number,
    direction: PropTypes.oneOf(['asc', 'desc']),
  }),
}

export default PatternFlyTable
