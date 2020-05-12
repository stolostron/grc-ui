'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var appStatus = {
  RUNNING: 0,
  NOT_RUNNING: 1,
  STOPPED: 2
};

function createCardStatusContent(status, labels) {
  var cardStatusArray = ['running', 'not-running', 'stopped'];
  var statusText = cardStatusArray[status];
  if (statusText) {
    var cardStatusClassName = 'bx--card-footer__app-status--' + statusText + ' active';
    var cardStatusTextClassName = 'bx--' + statusText + '__text';
    return _react2.default.createElement(
      'div',
      { className: cardStatusClassName },
      _react2.default.createElement(
        'div',
        { className: cardStatusTextClassName },
        labels[statusText.replace(/(-(\w))/g, function (match, separator, letter) {
          return letter.toUpperCase();
        }) + 'Text']
      )
    );
  }
  return '';
}

var CardStatus = function CardStatus(_ref) {
  var className = _ref.className,
      status = _ref.status,
      runningText = _ref.runningText,
      notRunningText = _ref.notRunningText,
      stoppedText = _ref.stoppedText,
      other = _objectWithoutProperties(_ref, ['className', 'status', 'runningText', 'notRunningText', 'stoppedText']);

  var cardStatusClasses = (0, _classnames2.default)(_defineProperty({
    'bx--card-footer__app-status': true
  }, className, className));
  var labels = {
    runningText: runningText,
    notRunningText: notRunningText,
    stoppedText: stoppedText
  };

  return _react2.default.createElement(
    'div',
    _extends({ className: cardStatusClasses }, other),
    createCardStatusContent(status, labels)
  );
};

CardStatus.propTypes = {
  status: _propTypes2.default.number,
  className: _propTypes2.default.string,
  runningText: _propTypes2.default.string,
  notRunningText: _propTypes2.default.string,
  stoppedText: _propTypes2.default.string
};

CardStatus.defaultProps = {
  status: 0,
  runningText: 'Running',
  notRunningText: 'Not Running',
  stoppedText: 'Stopped'
};

CardStatus.appStatus = appStatus;

exports.default = CardStatus;