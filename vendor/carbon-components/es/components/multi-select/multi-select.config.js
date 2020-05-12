/**
 * Copyright IBM Corp. 2016, 2018
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

var featureFlags = require('../../globals/js/feature-flags');

var _require = require('../../globals/js/settings'),
    prefix = _require.prefix;

var items = [{
  id: 'downshift-1-item-0',
  label: 'Option 1',
  selected: true
}, {
  id: 'downshift-1-item-1',
  label: 'Option 2'
}];
module.exports = {
  context: {
    featureFlags: featureFlags,
    prefix: prefix
  },
  variants: [{
    name: 'default',
    label: 'Multi Select',
    context: {
      items: items
    }
  }, {
    name: 'inline',
    label: 'Inline',
    context: {
      inline: true,
      items: items
    }
  }]
};