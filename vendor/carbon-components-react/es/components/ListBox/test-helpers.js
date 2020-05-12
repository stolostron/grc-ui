/**
 * Copyright IBM Corp. 2016, 2018
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
// Finding nodes in a ListBox
export var findMenuNode = function findMenuNode(wrapper) {
  return wrapper.find('.bx--list-box__menu');
};
export var findMenuItemNode = function findMenuItemNode(wrapper, index) {
  return wrapper.find('ListBoxMenuItem').at(index);
};
export var findMenuIconNode = function findMenuIconNode(wrapper) {
  return wrapper.find('.bx--list-box__menu-icon');
};
export var findFieldNode = function findFieldNode(wrapper) {
  return wrapper.find('.bx--list-box__field');
}; // Actions

export var openMenu = function openMenu(wrapper) {
  return findFieldNode(wrapper).simulate('click');
}; // Common assertions, useful for validating a11y props are set when needed

export var assertMenuOpen = function assertMenuOpen(wrapper, mockProps) {
  expect(findMenuNode(wrapper).children().length).toBe(mockProps.items.length);
  expect(findMenuIconNode(wrapper).prop('className')).toEqual(expect.stringContaining('bx--list-box__menu-icon--open'));
  expect(findFieldNode(wrapper).props()).toEqual(expect.objectContaining({
    'aria-expanded': true,
    'aria-haspopup': true,
    'aria-label': 'close menu'
  }));
};
export var assertMenuClosed = function assertMenuClosed(wrapper) {
  expect(findMenuIconNode(wrapper).prop('className')).toEqual(expect.stringContaining('bx--list-box__menu-icon'));
  expect(findMenuIconNode(wrapper).prop('className')).not.toEqual(expect.stringContaining('bx--list-box__menu-icon--open'));
  expect(findFieldNode(wrapper).props()).toEqual(expect.objectContaining({
    'aria-expanded': false,
    'aria-haspopup': true,
    'aria-label': 'open menu'
  }));
};
/**
 * `GenericItem` corresponds to an item in a collection that is passed to
 * MultiSelect that is in a predictable shape and works with the default
 * `itemToString` out of the box.
 * @param {number} index
 *
 * @returns {{id: string, label: string, value: string}}
 */

export var generateGenericItem = function generateGenericItem(index) {
  return {
    id: "id-".concat(index),
    label: "Item ".concat(index),
    value: index
  };
};
/**
 * `CustomItem` corresponds to a potentially different item structure that
 * might be passed into MultiSelect that we would need to supply a custom
 * `itemToString` method for
 * @param {number} index
 *
 * @returns {{field: string, value: string}}
 */

export var generateCustomItem = function generateCustomItem(index) {
  return {
    field: "Item ".concat(index),
    value: "Custom value ".concat(index)
  };
};
/**
 * Returns an Array filled by values generated by the `generator` function
 * @param {number} amount Number of elements to generate
 *
 * @returns {Array<Object>} Array of objects generated by `generator`
 */

export var generateItems = function generateItems(amount, generator) {
  return Array(amount).fill(null).map(function (_, i) {
    return generator(i);
  });
};
export var customItemToString = function customItemToString(_ref) {
  var field = _ref.field;
  return field;
};