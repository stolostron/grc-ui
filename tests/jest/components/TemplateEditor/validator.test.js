/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018, 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
'use strict'
import { validateYAML } from '../../../../src-web/components/TemplateEditor/utils/validate-yaml'

//parsed, exceptions, locale
describe('truncate middle', () => {
  it('should truncate string as expected', () => {
    expect(validateYAML('', [], '')).toMatchSnapshot()
  })
})
