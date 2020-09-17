/* Copyright (c) 2020 Red Hat, Inc. */
'use strict'

import renderer from 'react-test-renderer'
import React from 'react'
import PolicyStatusHistoryView from '../../../../src-web/components/common/PolicyStatusHistoryView'

Date.now = jest.fn(() => 1600291034000)

const data = [
  {
    'message': 'NonCompliant; violation - imagemanifestvulns exist: [sha256.483a3d0c52132c7b541af90a73df657388621f57ca3db3c40d28dc8174f5420f, sha256.6d2162915f9513d3f2222ffce9beff3d694093976a368875ead963c6436c0074, sha256.f35ca58473522e3621fb407d0e27df6b5ad12f829126e22cbf15e57447ef9f2f] in namespace open-cluster-management-agent; [sha256.6bdda142dd59a0dba873253572053c54844652258b63881eeb669f31488dcaca, sha256.73393a8c99c6674dce8371e55c6973d9d8ced8b8013310d1700b2cee14912fc9, sha256.82491e047a124a86e9185d84f056027a311b2ec9af7ee694aaed2fae380b81fd, sha256.8a1070897671f62c095a6f8c065da120b1d7a119b54989b82ae9fb9f35733d8f, sha256.8e994ac2ee4bbd2fc21a67c5e4884f1040d726e0193fc3e8acd3c4b9da4d921c, sha256.9316d67e3f15c3f55f4416140a679c69fb80a771f766b68d3c336c608fc643c4, sha256.c91d425d733e4331ae610b7d2d7e1e0420b5f5f6157c3a349423c520b4f97d53, sha256.dc8ead281dd2d6ca43fa616f019c464f2835aec1fa7432ae47a9a4603f3ea7a5] in namespace open-cluster-management-agent-addon; [sha256.7613d8f7db639147b91b16b54b24cfa351c3cbde6aa7b7bf1b9c80c260efad06] in namespace openshift-cluster-version',
    'timestamp': '2020-09-14T18:32:33Z'
  },
  {
    'message': 'NonCompliant; violation - imagemanifestvulns exist: [sha256.483a3d0c52132c7b541af90a73df657388621f57ca3db3c40d28dc8174f5420f, sha256.6d2162915f9513d3f2222ffce9beff3d694093976a368875ead963c6436c0074, sha256.f35ca58473522e3621fb407d0e27df6b5ad12f829126e22cbf15e57447ef9f2f] in namespace open-cluster-management-agent; [sha256.6bdda142dd59a0dba873253572053c54844652258b63881eeb669f31488dcaca, sha256.73393a8c99c6674dce8371e55c6973d9d8ced8b8013310d1700b2cee14912fc9, sha256.82491e047a124a86e9185d84f056027a311b2ec9af7ee694aaed2fae380b81fd, sha256.8a1070897671f62c095a6f8c065da120b1d7a119b54989b82ae9fb9f35733d8f, sha256.8e994ac2ee4bbd2fc21a67c5e4884f1040d726e0193fc3e8acd3c4b9da4d921c, sha256.9316d67e3f15c3f55f4416140a679c69fb80a771f766b68d3c336c608fc643c4, sha256.c91d425d733e4331ae610b7d2d7e1e0420b5f5f6157c3a349423c520b4f97d53, sha256.dc8ead281dd2d6ca43fa616f019c464f2835aec1fa7432ae47a9a4603f3ea7a5] in namespace open-cluster-management-agent-addon; [sha256.7613d8f7db639147b91b16b54b24cfa351c3cbde6aa7b7bf1b9c80c260efad06] in namespace openshift-cluster-version',
    'timestamp': '2020-09-14T18:27:46Z'
  },
  {
    'message': 'NonCompliant; violation - imagemanifestvulns exist: [sha256.483a3d0c52132c7b541af90a73df657388621f57ca3db3c40d28dc8174f5420f, sha256.6d2162915f9513d3f2222ffce9beff3d694093976a368875ead963c6436c0074, sha256.f35ca58473522e3621fb407d0e27df6b5ad12f829126e22cbf15e57447ef9f2f] in namespace open-cluster-management-agent; [sha256.6bdda142dd59a0dba873253572053c54844652258b63881eeb669f31488dcaca, sha256.73393a8c99c6674dce8371e55c6973d9d8ced8b8013310d1700b2cee14912fc9, sha256.82491e047a124a86e9185d84f056027a311b2ec9af7ee694aaed2fae380b81fd, sha256.8a1070897671f62c095a6f8c065da120b1d7a119b54989b82ae9fb9f35733d8f, sha256.8e994ac2ee4bbd2fc21a67c5e4884f1040d726e0193fc3e8acd3c4b9da4d921c, sha256.9316d67e3f15c3f55f4416140a679c69fb80a771f766b68d3c336c608fc643c4, sha256.c91d425d733e4331ae610b7d2d7e1e0420b5f5f6157c3a349423c520b4f97d53, sha256.dc8ead281dd2d6ca43fa616f019c464f2835aec1fa7432ae47a9a4603f3ea7a5] in namespace open-cluster-management-agent-addon; [sha256.7613d8f7db639147b91b16b54b24cfa351c3cbde6aa7b7bf1b9c80c260efad06] in namespace openshift-cluster-version',
    'timestamp': '2020-09-14T18:24:02Z'
  }
]

describe('PolicyTemplateDetailsView component', () => {
  it('renders as expected', () => {
    const component = renderer.create(
      <PolicyStatusHistoryView
        history={data}
        template={'policy-imagemanifestvulnpolicy'}
        cluster={'ironman'}
      />
    )
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('renders as expected -- no data', () => {
    const component = renderer.create(
      <PolicyStatusHistoryView
        history={[]}
        template={'policy-imagemanifestvulnpolicy'}
        cluster={'ironman'}
      />
    )
    expect(component.toJSON()).toMatchSnapshot()
  })
})
