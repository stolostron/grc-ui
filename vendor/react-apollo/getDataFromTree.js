var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { renderToStaticMarkup } from 'react-dom/server';
var Trie = (function () {
    function Trie() {
        this.children = null;
        this.added = false;
    }
    Trie.prototype.has = function () {
        var keys = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            keys[_i] = arguments[_i];
        }
        var node = this;
        return keys.every(function (key) {
            var child = node.children && node.children.get(key);
            return !!(child && (node = child));
        }) && node.added;
    };
    Trie.prototype.add = function () {
        var keys = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            keys[_i] = arguments[_i];
        }
        var node = this;
        keys.forEach(function (key) {
            var map = node.children || (node.children = new Map);
            var child = map.get(key);
            if (child) {
                node = child;
            }
            else {
                map.set(key, node = new Trie());
            }
        });
        node.added = true;
    };
    return Trie;
}());
var RenderPromises = (function () {
    function RenderPromises() {
        this.queryPromises = new Map();
        this.queryGraveyard = new Trie();
    }
    RenderPromises.prototype.addQueryPromise = function (queryInstance, finish) {
        var _a = queryInstance.props, query = _a.query, variables = _a.variables;
        if (!this.queryGraveyard.has(query, JSON.stringify(variables))) {
            this.queryPromises.set(queryInstance, new Promise(function (resolve) {
                resolve(queryInstance.fetchData());
            }));
            return null;
        }
        return finish();
    };
    RenderPromises.prototype.hasPromises = function () {
        return this.queryPromises.size > 0;
    };
    RenderPromises.prototype.consumeAndAwaitPromises = function () {
        var _this = this;
        var promises = [];
        this.queryPromises.forEach(function (promise, queryInstance) {
            var _a = queryInstance.props, query = _a.query, variables = _a.variables;
            _this.queryGraveyard.add(query, JSON.stringify(variables));
            promises.push(promise);
        });
        this.queryPromises.clear();
        return Promise.all(promises);
    };
    return RenderPromises;
}());
export { RenderPromises };
export default function getDataFromTree(tree, context) {
    if (context === void 0) { context = {}; }
    return getMarkupFromTree({
        tree: tree,
        context: context,
        renderFunction: renderToStaticMarkup,
    });
}
export function getMarkupFromTree(_a) {
    var tree = _a.tree, _b = _a.context, context = _b === void 0 ? {} : _b, _c = _a.renderFunction, renderFunction = _c === void 0 ? renderToStaticMarkup : _c;
    var renderPromises = new RenderPromises();
    var RenderPromisesProvider = (function (_super) {
        __extends(RenderPromisesProvider, _super);
        function RenderPromisesProvider() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        RenderPromisesProvider.prototype.getChildContext = function () {
            return __assign({}, context, { renderPromises: renderPromises });
        };
        RenderPromisesProvider.prototype.render = function () {
            return tree;
        };
        RenderPromisesProvider.childContextTypes = {
            renderPromises: PropTypes.object,
        };
        return RenderPromisesProvider;
    }(React.Component));
    Object.keys(context).forEach(function (key) {
        RenderPromisesProvider.childContextTypes[key] = PropTypes.any;
    });
    function process() {
        var html = renderFunction(React.createElement(RenderPromisesProvider));
        return renderPromises.hasPromises()
            ? renderPromises.consumeAndAwaitPromises().then(process)
            : html;
    }
    return Promise.resolve().then(process);
}
//# sourceMappingURL=getDataFromTree.js.map