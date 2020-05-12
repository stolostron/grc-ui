'use strict';

var _docsUrl = require('../docsUrl');

var _docsUrl2 = _interopRequireDefault(_docsUrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const meta = {
  docs: {
    url: (0, _docsUrl2.default)('group-exports')
  }
};
/* eslint-disable max-len */
const errors = {
  ExportNamedDeclaration: 'Multiple named export declarations; consolidate all named exports into a single export declaration',
  AssignmentExpression: 'Multiple CommonJS exports; consolidate all exports into a single assignment to `module.exports`'
};
/* eslint-enable max-len */

/**
 * Returns an array with names of the properties in the accessor chain for MemberExpression nodes
 *
 * Example:
 *
 * `module.exports = {}` => ['module', 'exports']
 * `module.exports.property = true` => ['module', 'exports', 'property']
 *
 * @param     {Node}    node    AST Node (MemberExpression)
 * @return    {Array}           Array with the property names in the chain
 * @private
 */
function accessorChain(node) {
  const chain = [];

  do {
    chain.unshift(node.property.name);

    if (node.object.type === 'Identifier') {
      chain.unshift(node.object.name);
      break;
    }

    node = node.object;
  } while (node.type === 'MemberExpression');

  return chain;
}

function create(context) {
  const nodes = {
    modules: new Set(),
    commonjs: new Set()
  };

  return {
    ExportNamedDeclaration(node) {
      nodes.modules.add(node);
    },

    AssignmentExpression(node) {
      if (node.left.type !== 'MemberExpression') {
        return;
      }

      const chain = accessorChain(node.left);

      // Assignments to module.exports
      // Deeper assignments are ignored since they just modify what's already being exported
      // (ie. module.exports.exported.prop = true is ignored)
      if (chain[0] === 'module' && chain[1] === 'exports' && chain.length <= 3) {
        nodes.commonjs.add(node);
        return;
      }

      // Assignments to exports (exports.* = *)
      if (chain[0] === 'exports' && chain.length === 2) {
        nodes.commonjs.add(node);
        return;
      }
    },

    'Program:exit': function onExit() {
      // Report multiple `export` declarations (ES2015 modules)
      if (nodes.modules.size > 1) {
        nodes.modules.forEach(node => {
          context.report({
            node,
            message: errors[node.type]
          });
        });
      }

      // Report multiple `module.exports` assignments (CommonJS)
      if (nodes.commonjs.size > 1) {
        nodes.commonjs.forEach(node => {
          context.report({
            node,
            message: errors[node.type]
          });
        });
      }
    }
  };
}

module.exports = {
  meta,
  create
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJ1bGVzL2dyb3VwLWV4cG9ydHMuanMiXSwibmFtZXMiOlsibWV0YSIsImRvY3MiLCJ1cmwiLCJlcnJvcnMiLCJFeHBvcnROYW1lZERlY2xhcmF0aW9uIiwiQXNzaWdubWVudEV4cHJlc3Npb24iLCJhY2Nlc3NvckNoYWluIiwibm9kZSIsImNoYWluIiwidW5zaGlmdCIsInByb3BlcnR5IiwibmFtZSIsIm9iamVjdCIsInR5cGUiLCJjcmVhdGUiLCJjb250ZXh0Iiwibm9kZXMiLCJtb2R1bGVzIiwiU2V0IiwiY29tbW9uanMiLCJhZGQiLCJsZWZ0IiwibGVuZ3RoIiwib25FeGl0Iiwic2l6ZSIsImZvckVhY2giLCJyZXBvcnQiLCJtZXNzYWdlIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7O0FBRUEsTUFBTUEsT0FBTztBQUNYQyxRQUFNO0FBQ0pDLFNBQUssdUJBQVEsZUFBUjtBQUREO0FBREssQ0FBYjtBQUtBO0FBQ0EsTUFBTUMsU0FBUztBQUNiQywwQkFBd0Isb0dBRFg7QUFFYkMsd0JBQXNCO0FBRlQsQ0FBZjtBQUlBOztBQUVBOzs7Ozs7Ozs7Ozs7QUFZQSxTQUFTQyxhQUFULENBQXVCQyxJQUF2QixFQUE2QjtBQUMzQixRQUFNQyxRQUFRLEVBQWQ7O0FBRUEsS0FBRztBQUNEQSxVQUFNQyxPQUFOLENBQWNGLEtBQUtHLFFBQUwsQ0FBY0MsSUFBNUI7O0FBRUEsUUFBSUosS0FBS0ssTUFBTCxDQUFZQyxJQUFaLEtBQXFCLFlBQXpCLEVBQXVDO0FBQ3JDTCxZQUFNQyxPQUFOLENBQWNGLEtBQUtLLE1BQUwsQ0FBWUQsSUFBMUI7QUFDQTtBQUNEOztBQUVESixXQUFPQSxLQUFLSyxNQUFaO0FBQ0QsR0FURCxRQVNTTCxLQUFLTSxJQUFMLEtBQWMsa0JBVHZCOztBQVdBLFNBQU9MLEtBQVA7QUFDRDs7QUFFRCxTQUFTTSxNQUFULENBQWdCQyxPQUFoQixFQUF5QjtBQUN2QixRQUFNQyxRQUFRO0FBQ1pDLGFBQVMsSUFBSUMsR0FBSixFQURHO0FBRVpDLGNBQVUsSUFBSUQsR0FBSjtBQUZFLEdBQWQ7O0FBS0EsU0FBTztBQUNMZCwyQkFBdUJHLElBQXZCLEVBQTZCO0FBQzNCUyxZQUFNQyxPQUFOLENBQWNHLEdBQWQsQ0FBa0JiLElBQWxCO0FBQ0QsS0FISTs7QUFLTEYseUJBQXFCRSxJQUFyQixFQUEyQjtBQUN6QixVQUFJQSxLQUFLYyxJQUFMLENBQVVSLElBQVYsS0FBbUIsa0JBQXZCLEVBQTJDO0FBQ3pDO0FBQ0Q7O0FBRUQsWUFBTUwsUUFBUUYsY0FBY0MsS0FBS2MsSUFBbkIsQ0FBZDs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxVQUFJYixNQUFNLENBQU4sTUFBYSxRQUFiLElBQXlCQSxNQUFNLENBQU4sTUFBYSxTQUF0QyxJQUFtREEsTUFBTWMsTUFBTixJQUFnQixDQUF2RSxFQUEwRTtBQUN4RU4sY0FBTUcsUUFBTixDQUFlQyxHQUFmLENBQW1CYixJQUFuQjtBQUNBO0FBQ0Q7O0FBRUQ7QUFDQSxVQUFJQyxNQUFNLENBQU4sTUFBYSxTQUFiLElBQTBCQSxNQUFNYyxNQUFOLEtBQWlCLENBQS9DLEVBQWtEO0FBQ2hETixjQUFNRyxRQUFOLENBQWVDLEdBQWYsQ0FBbUJiLElBQW5CO0FBQ0E7QUFDRDtBQUNGLEtBekJJOztBQTJCTCxvQkFBZ0IsU0FBU2dCLE1BQVQsR0FBa0I7QUFDaEM7QUFDQSxVQUFJUCxNQUFNQyxPQUFOLENBQWNPLElBQWQsR0FBcUIsQ0FBekIsRUFBNEI7QUFDMUJSLGNBQU1DLE9BQU4sQ0FBY1EsT0FBZCxDQUFzQmxCLFFBQVE7QUFDNUJRLGtCQUFRVyxNQUFSLENBQWU7QUFDYm5CLGdCQURhO0FBRWJvQixxQkFBU3hCLE9BQU9JLEtBQUtNLElBQVo7QUFGSSxXQUFmO0FBSUQsU0FMRDtBQU1EOztBQUVEO0FBQ0EsVUFBSUcsTUFBTUcsUUFBTixDQUFlSyxJQUFmLEdBQXNCLENBQTFCLEVBQTZCO0FBQzNCUixjQUFNRyxRQUFOLENBQWVNLE9BQWYsQ0FBdUJsQixRQUFRO0FBQzdCUSxrQkFBUVcsTUFBUixDQUFlO0FBQ2JuQixnQkFEYTtBQUVib0IscUJBQVN4QixPQUFPSSxLQUFLTSxJQUFaO0FBRkksV0FBZjtBQUlELFNBTEQ7QUFNRDtBQUNGO0FBL0NJLEdBQVA7QUFpREQ7O0FBRURlLE9BQU9DLE9BQVAsR0FBaUI7QUFDZjdCLE1BRGU7QUFFZmM7QUFGZSxDQUFqQiIsImZpbGUiOiJydWxlcy9ncm91cC1leHBvcnRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGRvY3NVcmwgZnJvbSAnLi4vZG9jc1VybCdcblxuY29uc3QgbWV0YSA9IHtcbiAgZG9jczoge1xuICAgIHVybDogZG9jc1VybCgnZ3JvdXAtZXhwb3J0cycpLFxuICB9LFxufVxuLyogZXNsaW50LWRpc2FibGUgbWF4LWxlbiAqL1xuY29uc3QgZXJyb3JzID0ge1xuICBFeHBvcnROYW1lZERlY2xhcmF0aW9uOiAnTXVsdGlwbGUgbmFtZWQgZXhwb3J0IGRlY2xhcmF0aW9uczsgY29uc29saWRhdGUgYWxsIG5hbWVkIGV4cG9ydHMgaW50byBhIHNpbmdsZSBleHBvcnQgZGVjbGFyYXRpb24nLFxuICBBc3NpZ25tZW50RXhwcmVzc2lvbjogJ011bHRpcGxlIENvbW1vbkpTIGV4cG9ydHM7IGNvbnNvbGlkYXRlIGFsbCBleHBvcnRzIGludG8gYSBzaW5nbGUgYXNzaWdubWVudCB0byBgbW9kdWxlLmV4cG9ydHNgJyxcbn1cbi8qIGVzbGludC1lbmFibGUgbWF4LWxlbiAqL1xuXG4vKipcbiAqIFJldHVybnMgYW4gYXJyYXkgd2l0aCBuYW1lcyBvZiB0aGUgcHJvcGVydGllcyBpbiB0aGUgYWNjZXNzb3IgY2hhaW4gZm9yIE1lbWJlckV4cHJlc3Npb24gbm9kZXNcbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqIGBtb2R1bGUuZXhwb3J0cyA9IHt9YCA9PiBbJ21vZHVsZScsICdleHBvcnRzJ11cbiAqIGBtb2R1bGUuZXhwb3J0cy5wcm9wZXJ0eSA9IHRydWVgID0+IFsnbW9kdWxlJywgJ2V4cG9ydHMnLCAncHJvcGVydHknXVxuICpcbiAqIEBwYXJhbSAgICAge05vZGV9ICAgIG5vZGUgICAgQVNUIE5vZGUgKE1lbWJlckV4cHJlc3Npb24pXG4gKiBAcmV0dXJuICAgIHtBcnJheX0gICAgICAgICAgIEFycmF5IHdpdGggdGhlIHByb3BlcnR5IG5hbWVzIGluIHRoZSBjaGFpblxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gYWNjZXNzb3JDaGFpbihub2RlKSB7XG4gIGNvbnN0IGNoYWluID0gW11cblxuICBkbyB7XG4gICAgY2hhaW4udW5zaGlmdChub2RlLnByb3BlcnR5Lm5hbWUpXG5cbiAgICBpZiAobm9kZS5vYmplY3QudHlwZSA9PT0gJ0lkZW50aWZpZXInKSB7XG4gICAgICBjaGFpbi51bnNoaWZ0KG5vZGUub2JqZWN0Lm5hbWUpXG4gICAgICBicmVha1xuICAgIH1cblxuICAgIG5vZGUgPSBub2RlLm9iamVjdFxuICB9IHdoaWxlIChub2RlLnR5cGUgPT09ICdNZW1iZXJFeHByZXNzaW9uJylcblxuICByZXR1cm4gY2hhaW5cbn1cblxuZnVuY3Rpb24gY3JlYXRlKGNvbnRleHQpIHtcbiAgY29uc3Qgbm9kZXMgPSB7XG4gICAgbW9kdWxlczogbmV3IFNldCgpLFxuICAgIGNvbW1vbmpzOiBuZXcgU2V0KCksXG4gIH1cblxuICByZXR1cm4ge1xuICAgIEV4cG9ydE5hbWVkRGVjbGFyYXRpb24obm9kZSkge1xuICAgICAgbm9kZXMubW9kdWxlcy5hZGQobm9kZSlcbiAgICB9LFxuXG4gICAgQXNzaWdubWVudEV4cHJlc3Npb24obm9kZSkge1xuICAgICAgaWYgKG5vZGUubGVmdC50eXBlICE9PSAnTWVtYmVyRXhwcmVzc2lvbicpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGNoYWluID0gYWNjZXNzb3JDaGFpbihub2RlLmxlZnQpXG5cbiAgICAgIC8vIEFzc2lnbm1lbnRzIHRvIG1vZHVsZS5leHBvcnRzXG4gICAgICAvLyBEZWVwZXIgYXNzaWdubWVudHMgYXJlIGlnbm9yZWQgc2luY2UgdGhleSBqdXN0IG1vZGlmeSB3aGF0J3MgYWxyZWFkeSBiZWluZyBleHBvcnRlZFxuICAgICAgLy8gKGllLiBtb2R1bGUuZXhwb3J0cy5leHBvcnRlZC5wcm9wID0gdHJ1ZSBpcyBpZ25vcmVkKVxuICAgICAgaWYgKGNoYWluWzBdID09PSAnbW9kdWxlJyAmJiBjaGFpblsxXSA9PT0gJ2V4cG9ydHMnICYmIGNoYWluLmxlbmd0aCA8PSAzKSB7XG4gICAgICAgIG5vZGVzLmNvbW1vbmpzLmFkZChub2RlKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgLy8gQXNzaWdubWVudHMgdG8gZXhwb3J0cyAoZXhwb3J0cy4qID0gKilcbiAgICAgIGlmIChjaGFpblswXSA9PT0gJ2V4cG9ydHMnICYmIGNoYWluLmxlbmd0aCA9PT0gMikge1xuICAgICAgICBub2Rlcy5jb21tb25qcy5hZGQobm9kZSlcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgfSxcblxuICAgICdQcm9ncmFtOmV4aXQnOiBmdW5jdGlvbiBvbkV4aXQoKSB7XG4gICAgICAvLyBSZXBvcnQgbXVsdGlwbGUgYGV4cG9ydGAgZGVjbGFyYXRpb25zIChFUzIwMTUgbW9kdWxlcylcbiAgICAgIGlmIChub2Rlcy5tb2R1bGVzLnNpemUgPiAxKSB7XG4gICAgICAgIG5vZGVzLm1vZHVsZXMuZm9yRWFjaChub2RlID0+IHtcbiAgICAgICAgICBjb250ZXh0LnJlcG9ydCh7XG4gICAgICAgICAgICBub2RlLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JzW25vZGUudHlwZV0sXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgLy8gUmVwb3J0IG11bHRpcGxlIGBtb2R1bGUuZXhwb3J0c2AgYXNzaWdubWVudHMgKENvbW1vbkpTKVxuICAgICAgaWYgKG5vZGVzLmNvbW1vbmpzLnNpemUgPiAxKSB7XG4gICAgICAgIG5vZGVzLmNvbW1vbmpzLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICAgICAgY29udGV4dC5yZXBvcnQoe1xuICAgICAgICAgICAgbm9kZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yc1tub2RlLnR5cGVdLFxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSxcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbWV0YSxcbiAgY3JlYXRlLFxufVxuIl19