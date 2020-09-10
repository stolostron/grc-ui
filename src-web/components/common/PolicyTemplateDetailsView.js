/* Copyright (c) 2020 Red Hat, Inc. */
'use strict'

import React from 'react'
import PropTypes from 'prop-types'
import {
  DescriptionList,
  DescriptionListTerm,
  DescriptionListGroup,
  DescriptionListDescription,
  Title,
} from '@patternfly/react-core'
import jsYaml from 'js-yaml'
import lodash from 'lodash'
import YamlEditor from './YamlEditor'
import PatternFlyTable from './PatternFlyTable'
import { LocaleContext } from './LocaleContext'
import policyTemplates from '../../tableDefinitions/policy-templates'
import { transform } from '../../tableDefinitions/utils'
import msgs from '../../../nls/platform.properties'

class PolicyTemplateDetailsView extends React.Component {
  constructor(props) {
    super(props)
  }

  static contextType = LocaleContext

  setContainerRef = container => {
    this.containerRef = container
    this.layoutEditors()
  }

  setEditor = (editor) => {
    this.editor=editor
    this.layoutEditors()
  }

  layoutEditors() {
    if (this.containerRef && this.editor) {
      const rect = this.containerRef.getBoundingClientRect()
      const width = rect.width
      const height = rect.height - 24 // minus height of title
      this.editor.layout({width, height})
    }
  }

  componentDidMount() {
    window.addEventListener('resize',  this.layoutEditors.bind(this))
  }

  render() {
    const { template } = this.props
    const { locale } = this.context
    let relatedObjects = lodash.get(template, 'status.relatedObjects', [])

    // inject cluster info into relatedObjects
    if (relatedObjects.length > 0) {
      relatedObjects = relatedObjects.map(o => {
        o.cluster = template.metadata.namespace
        return o
      })
    }
    const tableData = transform(relatedObjects, policyTemplates, locale)

    return (
      <div className='policy-template-details-view'>
        <div className='details'>
          <div className='overview'>
            <Title className='title' headingLevel="h2">{msgs.get('panel.header.template.details', locale)}</Title>
            <DescriptionList>
              <DescriptionListGroup>
                <DescriptionListTerm>{msgs.get('table.header.name', locale)}</DescriptionListTerm>
                <DescriptionListDescription>{lodash.get(template, 'metadata.name', '-')}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{msgs.get('table.header.cluster', locale)}</DescriptionListTerm>
                <DescriptionListDescription>
                  {lodash.get(template, 'metadata.namespace', '-')}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{msgs.get('table.header.kind', locale)}</DescriptionListTerm>
                <DescriptionListDescription>{lodash.get(template, 'kind', '-')}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{msgs.get('table.header.apiGroups', locale)}</DescriptionListTerm>
                <DescriptionListDescription>{lodash.get(template, 'apiVersion', '-')}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{msgs.get('table.header.compliant', locale)}</DescriptionListTerm>
                <DescriptionListDescription>
                  {lodash.get(template, 'status.compliant', '-')}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{msgs.get('table.header.violation.detail', locale)}</DescriptionListTerm>
                <DescriptionListDescription>
                  {JSON.stringify(lodash.get(template, 'status.compliancyDetails', '-'))}
                </DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </div>
          <div className='yaml' ref={this.setContainerRef}>
            <Title className='title' headingLevel="h2">{msgs.get('panel.header.template.yaml', locale)}</Title>
            <div>
              <YamlEditor
                width={'100%'}
                height={'500px'}
                readOnly
                setEditor={this.setEditor}
                yaml={jsYaml.safeDump(template)} />
            </div>
          </div>
        </div>
        <div className='table'>
          <Title className='title' headingLevel="h2">{msgs.get('panel.header.related.resources', locale)}</Title>
          <PatternFlyTable {...tableData} noResultMsg={msgs.get('table.search.no.results', locale)} />
        </div>
      </div>

    )
  }
}

PolicyTemplateDetailsView.propTypes = {
  template: PropTypes.object,
}

export default PolicyTemplateDetailsView
