/* Copyright (c) 2020 Red Hat, Inc. */
'use strict'
import purifyReactNode from '../../../../src-web/components/common/PurifyReactNode'

describe('test purifyReactNode', () => {
  it('renders null node', () => {
    expect(purifyReactNode(null)).toMatchSnapshot()
  })
  it('renders empty node', () => {
    expect(purifyReactNode('')).toMatchSnapshot()
  })
  it('renders string', () => {
    expect(purifyReactNode('Red Hat')).toMatchSnapshot()
  })
  it('renders number', () => {
    expect(purifyReactNode(2020)).toMatchSnapshot()
  })
  it('renders empty object', () => {
    expect(purifyReactNode({})).toMatchSnapshot()
  })
  it('renders empty array', () => {
    expect(purifyReactNode([])).toMatchSnapshot()
  })
  it('renders object1', () => {
    const object1 = {
      props: {
        name: 'object1'
      }
    }
    expect(purifyReactNode(object1)).toMatchSnapshot()
  })
  it('renders object2', () => {
    const object2 = {
      props: {
        name: 'object2',
        children: 'object2child1'
      }
    }
    expect(purifyReactNode(object2)).toMatchSnapshot()
  })
  it('renders object3', () => {
    const object3 = {
      props: {
        name: 'object3',
        children: {
          props: {
            children: [
              'object3child1',
              {
                props: {
                  name: 'object4',
                  children: 'object4child1'
                }
              }
            ]
          }
        }
      }
    }
    expect(purifyReactNode(object3)).toMatchSnapshot()
  })
})
