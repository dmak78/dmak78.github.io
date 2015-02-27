module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "./build/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

  "use strict";
  
  // import _ from 'lodash';
  var _ = __webpack_require__(25);
  var fs = __webpack_require__(23);
  var path = __webpack_require__(26);
  var express = __webpack_require__(20);
  var React = __webpack_require__(1);
  var Dispatcher = __webpack_require__(3);
  var ActionTypes = __webpack_require__(2);
  var AppStore = __webpack_require__(7);
  
  var server = express();
  
  server.set("port", process.env.PORT || 5000);
  server.use(express["static"](path.join(__dirname)));
  
  //
  // Page API
  // -----------------------------------------------------------------------------
  server.get("/api/page/*", function (req, res) {
    var path = req.path.substr(9);
    var page = AppStore.getPage(path);
    res.send(page);
  });
  
  //
  // Server-side rendering
  // -----------------------------------------------------------------------------
  
  // The top-level React component + HTML template for it
  var App = React.createFactory(__webpack_require__(11));
  var templateFile = path.join(__dirname, "templates/index.html");
  var template = _.template(fs.readFileSync(templateFile, "utf8"));
  
  server.get("*", function (req, res) {
    var data = { description: "" };
    var app = new App({
      path: req.path,
      onSetTitle: function onSetTitle(title) {
        data.title = title;
      },
      onSetMeta: function onSetMeta(name, content) {
        data[name] = content;
      },
      onPageNotFound: function onPageNotFound() {
        res.status(404);
      }
    });
    data.body = React.renderToString(app);
    var html = template(data);
    res.send(html);
  });
  
  // Load pages from the `/src/content/` folder into the AppStore
  (function () {
    var assign = __webpack_require__(4);
    var fm = __webpack_require__(22);
    var jade = __webpack_require__(24);
    var sourceDir = path.join(__dirname, "./content");
    var getFiles = (function (_getFiles) {
      var _getFilesWrapper = function getFiles(_x) {
        return _getFiles.apply(this, arguments);
      };
  
      _getFilesWrapper.toString = function () {
        return _getFiles.toString();
      };
  
      return _getFilesWrapper;
    })(function (dir) {
      var pages = [];
      fs.readdirSync(dir).forEach(function (file) {
        var stat = fs.statSync(path.join(dir, file));
        if (stat && stat.isDirectory()) {
          pages = pages.concat(getFiles(file));
        } else {
          // Convert the file to a Page object
          var filename = path.join(dir, file);
          var url = filename.substr(sourceDir.length, filename.length - sourceDir.length - 5).replace("\\", "/");
          if (url.indexOf("/index", url.length - 6) !== -1) {
            url = url.substr(0, url.length - (url.length > 6 ? 6 : 5));
          }
          var source = fs.readFileSync(filename, "utf8");
          var content = fm(source);
          var html = jade.render(content.body, null, "  ");
          var page = assign({}, { path: url, body: html }, content.attributes);
          Dispatcher.handleServerAction({
            actionType: ActionTypes.LOAD_PAGE,
            path: url,
            page: page
          });
        }
      });
      return pages;
    });
    return getFiles(sourceDir);
  })();
  
  server.listen(server.get("port"), function () {
    if (process.send) {
      process.send("online");
    } else {
      console.log("The server is running at http://localhost:" + server.get("port"));
    }
  });
  /*
   * React.js Starter Kit
   * Copyright (c) 2014 Konstantin Tarkus (@koistya), KriaSoft LLC.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.txt file in the root directory of this source tree.
   */

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

  module.exports = require("react");

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

  "use strict";
  
  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
  
  var keyMirror = _interopRequire(__webpack_require__(10));
  
  var ActionTypes = keyMirror({
  
    LOAD_PAGE: null,
    LOAD_PAGE_SUCCESS: null,
    LOAD_PAGE_ERROR: null,
    CHANGE_LOCATION: null
  
  });
  
  module.exports = ActionTypes;
  /*
   * React.js Starter Kit
   * Copyright (c) 2014 Konstantin Tarkus (@koistya), KriaSoft LLC.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.txt file in the root directory of this source tree.
   */

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

  "use strict";
  
  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
  
  var Flux = _interopRequire(__webpack_require__(21));
  
  var PayloadSources = _interopRequire(__webpack_require__(6));
  
  var assign = _interopRequire(__webpack_require__(4));
  
  /**
   * A singleton that operates as the central hub for application updates.
   * For more information visit https://facebook.github.io/flux/
   */
  var Dispatcher = assign(new Flux.Dispatcher(), {
  
    /**
     * @param {object} action The details of the action, including the action's
     * type and additional data coming from the server.
     */
    handleServerAction: function handleServerAction(action) {
      var payload = {
        source: PayloadSources.SERVER_ACTION,
        action: action
      };
      this.dispatch(payload);
    },
  
    /**
     * @param {object} action The details of the action, including the action's
     * type and additional data coming from the view.
     */
    handleViewAction: function handleViewAction(action) {
      var payload = {
        source: PayloadSources.VIEW_ACTION,
        action: action
      };
      this.dispatch(payload);
    }
  
  });
  
  module.exports = Dispatcher;
  /*
   * React.js Starter Kit
   * Copyright (c) 2014 Konstantin Tarkus (@koistya), KriaSoft LLC.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.txt file in the root directory of this source tree.
   */

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

  /**
   * Copyright 2014, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the BSD-style license found in the
   * LICENSE file in the root directory of this source tree. An additional grant
   * of patent rights can be found in the PATENTS file in the same directory.
   *
   * @providesModule Object.assign
   */
  
  // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.assign
  
  function assign(target, sources) {
    if (target == null) {
      throw new TypeError('Object.assign target cannot be null or undefined');
    }
  
    var to = Object(target);
    var hasOwnProperty = Object.prototype.hasOwnProperty;
  
    for (var nextIndex = 1; nextIndex < arguments.length; nextIndex++) {
      var nextSource = arguments[nextIndex];
      if (nextSource == null) {
        continue;
      }
  
      var from = Object(nextSource);
  
      // We don't currently support accessors nor proxies. Therefore this
      // copy cannot throw. If we ever supported this then we must handle
      // exceptions and side-effects. We don't support symbols so they won't
      // be transferred.
  
      for (var key in from) {
        if (hasOwnProperty.call(from, key)) {
          to[key] = from[key];
        }
      }
    }
  
    return to;
  };
  
  module.exports = assign;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

  "use strict";
  
  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
  
  var Dispatcher = _interopRequire(__webpack_require__(3));
  
  var ActionTypes = _interopRequire(__webpack_require__(2));
  
  var ExecutionEnvironment = _interopRequire(__webpack_require__(8));
  
  var http = _interopRequire(__webpack_require__(27));
  
  module.exports = {
  
    navigateTo: function navigateTo(path) {
      if (ExecutionEnvironment.canUseDOM) {
        window.history.pushState({}, document.title, path);
      }
  
      Dispatcher.handleViewAction({
        actionType: ActionTypes.CHANGE_LOCATION, path: path
      });
    },
  
    loadPage: function loadPage(path, cb) {
      Dispatcher.handleViewAction({
        actionType: ActionTypes.LOAD_PAGE, path: path
      });
  
      http.get("/api/page" + path).accept("application/json").end(function (err, res) {
        Dispatcher.handleServerAction({
          actionType: ActionTypes.LOAD_PAGE, path: path, err: err, page: res.body
        });
        if (cb) {
          cb();
        }
      });
    }
  
  };
  /*
   * React.js Starter Kit
   * Copyright (c) 2014 Konstantin Tarkus (@koistya), KriaSoft LLC.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.txt file in the root directory of this source tree.
   */

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

  "use strict";
  
  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
  
  var keyMirror = _interopRequire(__webpack_require__(10));
  
  var PayloadSources = keyMirror({
  
    VIEW_ACTION: null,
    SERVER_ACTION: null
  
  });
  
  module.exports = PayloadSources;
  /*
   * React.js Starter Kit
   * Copyright (c) 2014 Konstantin Tarkus (@koistya), KriaSoft LLC.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.txt file in the root directory of this source tree.
   */

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

  "use strict";
  
  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
  
  var Dispatcher = _interopRequire(__webpack_require__(3));
  
  var ActionTypes = _interopRequire(__webpack_require__(2));
  
  var PayloadSources = _interopRequire(__webpack_require__(6));
  
  var EventEmitter = _interopRequire(__webpack_require__(19));
  
  var assign = _interopRequire(__webpack_require__(4));
  
  var CHANGE_EVENT = "change";
  
  var _pages = {};
  var _loading = false;
  
  if (true) {
    _pages["/"] = { title: "Home Page" };
    _pages["/privacy"] = { title: "Privacy Policy" };
  }
  
  var AppStore = assign({}, EventEmitter.prototype, {
  
    /**
     * Gets page data by the given URL path.
     *
     * @param {String} path URL path.
     * @returns {*} Page data.
     */
    getPage: function getPage(path) {
      return path in _pages ? _pages[path] : {
        title: "Page Not Found",
        type: "notfound"
      };
    },
  
    /**
     * Emits change event to all registered event listeners.
     *
     * @returns {Boolean} Indication if we've emitted an event.
     */
    emitChange: function emitChange() {
      return this.emit(CHANGE_EVENT);
    },
  
    /**
     * Register a new change event listener.
     *
     * @param {function} callback Callback function.
     */
    onChange: function onChange(callback) {
      this.on(CHANGE_EVENT, callback);
    },
  
    /**
     * Remove change event listener.
     *
     * @param {function} callback Callback function.
     */
    off: function off(callback) {
      this.off(CHANGE_EVENT, callback);
    }
  
  });
  
  AppStore.dispatcherToken = Dispatcher.register(function (payload) {
    var action = payload.action;
  
    switch (action.actionType) {
  
      case ActionTypes.LOAD_PAGE:
        if (action.source === PayloadSources.VIEW_ACTION) {
          _loading = true;
        } else {
          if (!action.err) {
            _pages[action.path] = action.page;
          }
        }
        AppStore.emitChange();
        break;
  
      default:
      // Do nothing
  
    }
  });
  
  module.exports = AppStore;
  /*
   * React.js Starter Kit
   * Copyright (c) 2014 Konstantin Tarkus (@koistya), KriaSoft LLC.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.txt file in the root directory of this source tree.
   */

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

  /**
   * Copyright 2013-2014, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the BSD-style license found in the
   * LICENSE file in the root directory of this source tree. An additional grant
   * of patent rights can be found in the PATENTS file in the same directory.
   *
   * @providesModule ExecutionEnvironment
   */
  
  /*jslint evil: true */
  
  "use strict";
  
  var canUseDOM = !!(
    typeof window !== 'undefined' &&
    window.document &&
    window.document.createElement
  );
  
  /**
   * Simple, lightweight module assisting with the detection and context of
   * Worker. Helps avoid circular dependencies and allows code to reason about
   * whether or not they are in a Worker, even if they never include the main
   * `ReactWorker` dependency.
   */
  var ExecutionEnvironment = {
  
    canUseDOM: canUseDOM,
  
    canUseWorkers: typeof Worker !== 'undefined',
  
    canUseEventListeners:
      canUseDOM && !!(window.addEventListener || window.attachEvent),
  
    canUseViewport: canUseDOM && !!window.screen,
  
    isInWorker: !canUseDOM // For now, this is true - might change in the future.
  
  };
  
  module.exports = ExecutionEnvironment;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

  /**
   * Copyright 2013-2014, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the BSD-style license found in the
   * LICENSE file in the root directory of this source tree. An additional grant
   * of patent rights can be found in the PATENTS file in the same directory.
   *
   * @providesModule invariant
   */
  
  "use strict";
  
  /**
   * Use invariant() to assert state which your program assumes to be true.
   *
   * Provide sprintf-style format (only %s is supported) and arguments
   * to provide information about what broke and what you were
   * expecting.
   *
   * The invariant message will be stripped in production, but the invariant
   * will remain to ensure logic does not differ in production.
   */
  
  var invariant = function(condition, format, a, b, c, d, e, f) {
    if (true) {
      if (format === undefined) {
        throw new Error('invariant requires an error message argument');
      }
    }
  
    if (!condition) {
      var error;
      if (format === undefined) {
        error = new Error(
          'Minified exception occurred; use the non-minified dev environment ' +
          'for the full error message and additional helpful warnings.'
        );
      } else {
        var args = [a, b, c, d, e, f];
        var argIndex = 0;
        error = new Error(
          'Invariant Violation: ' +
          format.replace(/%s/g, function() { return args[argIndex++]; })
        );
      }
  
      error.framesToPop = 1; // we don't care about invariant's own frame
      throw error;
    }
  };
  
  module.exports = invariant;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

  /**
   * Copyright 2013-2014, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the BSD-style license found in the
   * LICENSE file in the root directory of this source tree. An additional grant
   * of patent rights can be found in the PATENTS file in the same directory.
   *
   * @providesModule keyMirror
   * @typechecks static-only
   */
  
  "use strict";
  
  var invariant = __webpack_require__(9);
  
  /**
   * Constructs an enumeration with keys equal to their value.
   *
   * For example:
   *
   *   var COLORS = keyMirror({blue: null, red: null});
   *   var myColor = COLORS.blue;
   *   var isColorValid = !!COLORS[myColor];
   *
   * The last line could not be performed if the values of the generated enum were
   * not equal to their keys.
   *
   *   Input:  {key1: val1, key2: val2}
   *   Output: {key1: key1, key2: key2}
   *
   * @param {object} obj
   * @return {object}
   */
  var keyMirror = function(obj) {
    var ret = {};
    var key;
    (true ? invariant(
      obj instanceof Object && !Array.isArray(obj),
      'keyMirror(...): Argument must be an object.'
    ) : invariant(obj instanceof Object && !Array.isArray(obj)));
    for (key in obj) {
      if (!obj.hasOwnProperty(key)) {
        continue;
      }
      ret[key] = key;
    }
    return ret;
  };
  
  module.exports = keyMirror;


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

  "use strict";
  
  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
  
  var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
  
  __webpack_require__(17);
  
  var React = _interopRequire(__webpack_require__(1));
  
  var invariant = _interopRequire(__webpack_require__(9));
  
  var AppActions = _interopRequire(__webpack_require__(5));
  
  var NavigationMixin = _interopRequire(__webpack_require__(12));
  
  var AppStore = _interopRequire(__webpack_require__(7));
  
  var Navbar = _interopRequire(__webpack_require__(14));
  
  var ContentPage = _interopRequire(__webpack_require__(13));
  
  var NotFoundPage = _interopRequire(__webpack_require__(15));
  
  module.exports = React.createClass({
    displayName: "App",
  
    mixins: [NavigationMixin],
  
    propTypes: {
      path: React.PropTypes.string.isRequired,
      onSetTitle: React.PropTypes.func.isRequired,
      onSetMeta: React.PropTypes.func.isRequired,
      onPageNotFound: React.PropTypes.func.isRequired
    },
  
    render: function render() {
      var page = AppStore.getPage(this.props.path);
      invariant(page !== undefined, "Failed to load page content.");
      this.props.onSetTitle(page.title);
  
      if (page.type === "notfound") {
        this.props.onPageNotFound();
        return React.createElement(NotFoundPage, page);
      }
  
      return (
        /* jshint ignore:start */
        React.createElement(
          "div",
          { className: "App" },
          React.createElement(Navbar, null),
          this.props.path === "/" ? React.createElement(
            "div",
            { className: "jumbotron" },
            React.createElement(
              "div",
              { className: "container text-center" },
              React.createElement(
                "h1",
                null,
                "React"
              ),
              React.createElement(
                "p",
                null,
                "Complex web apps made easy"
              )
            )
          ) : React.createElement(
            "div",
            { className: "container" },
            React.createElement(
              "h2",
              null,
              page.title
            )
          ),
          React.createElement(ContentPage, _extends({ className: "container" }, page)),
          React.createElement(
            "div",
            { className: "navbar-footer" },
            React.createElement(
              "div",
              { className: "container" },
              React.createElement(
                "p",
                { className: "text-muted" },
                React.createElement(
                  "span",
                  null,
                  "© KriaSoft"
                ),
                React.createElement(
                  "span",
                  null,
                  React.createElement(
                    "a",
                    { href: "/" },
                    "Home"
                  )
                ),
                React.createElement(
                  "span",
                  null,
                  React.createElement(
                    "a",
                    { href: "/privacy" },
                    "Privacy"
                  )
                )
              )
            )
          )
        )
      );
    }
  
  });
  /*
   * React.js Starter Kit
   * Copyright (c) 2014 Konstantin Tarkus (@koistya), KriaSoft LLC.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.txt file in the root directory of this source tree.
   */

  /* jshint ignore:end */

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

  "use strict";
  
  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
  
  var React = _interopRequire(__webpack_require__(1));
  
  var ExecutionEnvironment = _interopRequire(__webpack_require__(8));
  
  var AppActions = _interopRequire(__webpack_require__(5));
  
  var NavigationMixin = {
  
    componentDidMount: function componentDidMount() {
      if (ExecutionEnvironment.canUseDOM) {
        window.addEventListener("popstate", this.handlePopState);
        window.addEventListener("click", this.handleClick);
      }
    },
  
    componentWillUnmount: function componentWillUnmount() {
      window.removeEventListener("popstate", this.handlePopState);
      window.removeEventListener("click", this.handleClick);
    },
  
    handlePopState: function handlePopState(event) {
      console.log(event);
      if (event.state) {
        var path = event.state.path;
        // TODO: Replace current location
        // replace(path, event.state);
      } else {
        AppActions.navigateTo(window.location.pathname);
      }
    },
  
    handleClick: function handleClick(event) {
      if (event.button === 1 || event.metaKey || event.ctrlKey || event.shiftKey || event.defaultPrevented) {
        return;
      }
  
      // Ensure link
      var el = event.target;
      while (el && el.nodeName !== "A") {
        el = el.parentNode;
      }
      if (!el || el.nodeName !== "A") {
        return;
      }
  
      // Ignore if tag has
      // 1. "download" attribute
      // 2. rel="external" attribute
      if (el.getAttribute("download") || el.getAttribute("rel") === "external") {
        return;
      }
  
      // Ensure non-hash for the same path
      var link = el.getAttribute("href");
      if (el.pathname === location.pathname && (el.hash || "#" === link)) {
        return;
      }
  
      // Check for mailto: in the href
      if (link && link.indexOf("mailto:") > -1) {
        return;
      }
  
      // Check target
      if (el.target) {
        return;
      }
  
      // X-origin
      var origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "");
      if (!(el.href && el.href.indexOf(origin) === 0)) {
        return;
      }
  
      // Rebuild path
      var path = el.pathname + el.search + (el.hash || "");
  
      event.preventDefault();
      AppActions.loadPage(path, function () {
        AppActions.navigateTo(path);
      });
    }
  
  };
  
  module.exports = NavigationMixin;
  /*
   * React.js Starter Kit
   * Copyright (c) 2014 Konstantin Tarkus (@koistya), KriaSoft LLC.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.txt file in the root directory of this source tree.
   */

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

  "use strict";
  
  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
  
  var React = _interopRequire(__webpack_require__(1));
  
  module.exports = React.createClass({
    displayName: "ContentPage",
  
    propTypes: {
      body: React.PropTypes.string.isRequired
    },
  
    render: function render() {
      var _props = this.props;
      var className = _props.className;
      var title = _props.title;
      var body = _props.body;
      var other = _props.other;
  
      /* jshint ignore:start */
      return React.createElement("div", { className: "ContentPage " + className,
        dangerouslySetInnerHTML: { __html: body } });
      /* jshint ignore:end */
    }
  
  });
  /*
   * React.js Starter Kit
   * Copyright (c) 2014 Konstantin Tarkus (@koistya), KriaSoft LLC.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.txt file in the root directory of this source tree.
   */

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

  "use strict";
  
  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
  
  var React = _interopRequire(__webpack_require__(1));
  
  module.exports = React.createClass({
    displayName: "Navbar",
  
    render: function render() {
      return (
        /* jshint ignore:start */
        React.createElement(
          "div",
          { className: "navbar-top", role: "navigation" },
          React.createElement(
            "div",
            { className: "container" },
            React.createElement(
              "a",
              { className: "navbar-brand row", href: "/" },
              React.createElement("img", { src: __webpack_require__(18), width: "38", height: "38", alt: "React" }),
              React.createElement(
                "span",
                null,
                "React.js Starter Kit"
              )
            )
          )
        )
      );
    }
  
  });
  /*
   * React.js Starter Kit
   * Copyright (c) 2014 Konstantin Tarkus (@koistya), KriaSoft LLC.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.txt file in the root directory of this source tree.
   */

  /* jshint ignore:end */

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

  "use strict";
  
  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
  
  //require('./NotFoundPage.less');
  
  var React = _interopRequire(__webpack_require__(1));
  
  module.exports = React.createClass({
    displayName: "NotFoundPage",
  
    render: function render() {
      return (
        /* jshint ignore:start */
        React.createElement(
          "div",
          null,
          React.createElement(
            "h1",
            null,
            "Page Not Found"
          ),
          React.createElement(
            "p",
            null,
            "Sorry, but the page you were trying to view does not exist."
          )
        )
      );
    }
  
  });
  /*
   * React.js Starter Kit
   * Copyright (c) 2014 Konstantin Tarkus (@koistya), KriaSoft LLC.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.txt file in the root directory of this source tree.
   */

  /* jshint ignore:end */

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

  module.exports = function() {
  	var list = [];
  	list.toString = function toString() {
  		var result = [];
  		for(var i = 0; i < this.length; i++) {
  			var item = this[i];
  			if(item[2]) {
  				result.push("@media " + item[2] + "{" + item[1] + "}");
  			} else {
  				result.push(item[1]);
  			}
  		}
  		return result.join("");
  	};
  	return list;
  }

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

  exports = module.exports = __webpack_require__(16)();
  exports.push([module.id, "/*\n * React.js Starter Kit\n * Copyright (c) 2014 Konstantin Tarkus (@koistya), KriaSoft LLC.\n *\n * This source code is licensed under the MIT license found in the\n * LICENSE.txt file in the root directory of this source tree.\n */\n", ""]);

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

  module.exports = "data:image/png;base64,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"

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

  module.exports = require("eventemitter3");

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

  module.exports = require("express");

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

  module.exports = require("flux");

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

  module.exports = require("front-matter");

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

  module.exports = require("fs");

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

  module.exports = require("jade");

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

  module.exports = require("lodash");

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

  module.exports = require("path");

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

  module.exports = require("superagent");

/***/ }
/******/ ])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgYzA0ZDlkNTMyYWQ1NmVkOThkYTAiLCJ3ZWJwYWNrOi8vLy4vc3JjL3NlcnZlci5qcyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJyZWFjdFwiIiwid2VicGFjazovLy8uL3NyYy9jb25zdGFudHMvQWN0aW9uVHlwZXMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvcmUvRGlzcGF0Y2hlci5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0L2xpYi9PYmplY3QuYXNzaWduLmpzIiwid2VicGFjazovLy8uL3NyYy9hY3Rpb25zL0FwcEFjdGlvbnMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbnN0YW50cy9QYXlsb2FkU291cmNlcy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvc3RvcmVzL0FwcFN0b3JlLmpzIiwid2VicGFjazovLy8uL34vcmVhY3QvbGliL0V4ZWN1dGlvbkVudmlyb25tZW50LmpzIiwid2VicGFjazovLy8uL34vcmVhY3QvbGliL2ludmFyaWFudC5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0L2xpYi9rZXlNaXJyb3IuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvQXBwL0FwcC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9BcHAvTmF2aWdhdGlvbk1peGluLmpzIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL0NvbnRlbnRQYWdlL0NvbnRlbnRQYWdlLmpzIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL05hdmJhci9OYXZiYXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvTm90Rm91bmRQYWdlL05vdEZvdW5kUGFnZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2Nzcy1sb2FkZXIvY3NzVG9TdHJpbmcuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvQXBwL0FwcC5sZXNzIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL05hdmJhci9sb2dvLXNtYWxsLnBuZyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJldmVudGVtaXR0ZXIzXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiZXhwcmVzc1wiIiwid2VicGFjazovLy9leHRlcm5hbCBcImZsdXhcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJmcm9udC1tYXR0ZXJcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJmc1wiIiwid2VicGFjazovLy9leHRlcm5hbCBcImphZGVcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJsb2Rhc2hcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJwYXRoXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwic3VwZXJhZ2VudFwiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsdUJBQWU7QUFDZjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSx3Qzs7Ozs7Ozs7OztBQzNCQSxNQUFJLENBQUMsR0FBRyxtQkFBTyxDQUFDLEVBQVEsQ0FBQyxDQUFDO0FBQzFCLE1BQUksRUFBRSxHQUFHLG1CQUFPLENBQUMsRUFBSSxDQUFDLENBQUM7QUFDdkIsTUFBSSxJQUFJLEdBQUcsbUJBQU8sQ0FBQyxFQUFNLENBQUMsQ0FBQztBQUMzQixNQUFJLE9BQU8sR0FBRyxtQkFBTyxDQUFDLEVBQVMsQ0FBQyxDQUFDO0FBQ2pDLE1BQUksS0FBSyxHQUFHLG1CQUFPLENBQUMsQ0FBTyxDQUFDLENBQUM7QUFDN0IsTUFBSSxVQUFVLEdBQUcsbUJBQU8sQ0FBQyxDQUFtQixDQUFDLENBQUM7QUFDOUMsTUFBSSxXQUFXLEdBQUcsbUJBQU8sQ0FBQyxDQUF5QixDQUFDLENBQUM7QUFDckQsTUFBSSxRQUFRLEdBQUcsbUJBQU8sQ0FBQyxDQUFtQixDQUFDLENBQUM7O0FBRTVD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QUEsbUM7Ozs7OztBQ0FBLDJDOzs7Ozs7QUNBQSxpQzs7Ozs7O0FDQUEsbUM7Ozs7OztBQ0FBLHFDOzs7Ozs7QUNBQSxtQzs7Ozs7O0FDQUEseUMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0ZXhwb3J0czoge30sXG4gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuIFx0XHRcdGxvYWRlZDogZmFsc2VcbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCIuL2J1aWxkL1wiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIHdlYnBhY2svYm9vdHN0cmFwIGMwNGQ5ZDUzMmFkNTZlZDk4ZGEwXG4gKiovIiwiLypcbiAqIFJlYWN0LmpzIFN0YXJ0ZXIgS2l0XG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQgS29uc3RhbnRpbiBUYXJrdXMgKEBrb2lzdHlhKSwgS3JpYVNvZnQgTExDLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRS50eHQgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8vIGltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG52YXIgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xudmFyIGZzID0gcmVxdWlyZSgnZnMnKTtcbnZhciBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xudmFyIGV4cHJlc3MgPSByZXF1aXJlKCdleHByZXNzJyk7XG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIERpc3BhdGNoZXIgPSByZXF1aXJlKCcuL2NvcmUvRGlzcGF0Y2hlcicpO1xudmFyIEFjdGlvblR5cGVzID0gcmVxdWlyZSgnLi9jb25zdGFudHMvQWN0aW9uVHlwZXMnKTtcbnZhciBBcHBTdG9yZSA9IHJlcXVpcmUoJy4vc3RvcmVzL0FwcFN0b3JlJyk7XG5cbnZhciBzZXJ2ZXIgPSBleHByZXNzKCk7XG5cbnNlcnZlci5zZXQoJ3BvcnQnLCAocHJvY2Vzcy5lbnYuUE9SVCB8fCA1MDAwKSk7XG5zZXJ2ZXIudXNlKGV4cHJlc3Muc3RhdGljKHBhdGguam9pbihfX2Rpcm5hbWUpKSk7XG5cbi8vXG4vLyBQYWdlIEFQSVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbnNlcnZlci5nZXQoJy9hcGkvcGFnZS8qJywgZnVuY3Rpb24ocmVxLCByZXMpIHtcbiAgdmFyIHBhdGggPSByZXEucGF0aC5zdWJzdHIoOSk7XG4gIHZhciBwYWdlID0gQXBwU3RvcmUuZ2V0UGFnZShwYXRoKTtcbiAgcmVzLnNlbmQocGFnZSk7XG59KTtcblxuLy9cbi8vIFNlcnZlci1zaWRlIHJlbmRlcmluZ1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLy8gVGhlIHRvcC1sZXZlbCBSZWFjdCBjb21wb25lbnQgKyBIVE1MIHRlbXBsYXRlIGZvciBpdFxudmFyIEFwcCA9IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL0FwcCcpKTtcbnZhciB0ZW1wbGF0ZUZpbGUgPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAndGVtcGxhdGVzL2luZGV4Lmh0bWwnKTtcbnZhciB0ZW1wbGF0ZSA9IF8udGVtcGxhdGUoZnMucmVhZEZpbGVTeW5jKHRlbXBsYXRlRmlsZSwgJ3V0ZjgnKSk7XG5cbnNlcnZlci5nZXQoJyonLCBmdW5jdGlvbihyZXEsIHJlcykge1xuICB2YXIgZGF0YSA9IHtkZXNjcmlwdGlvbjogJyd9O1xuICB2YXIgYXBwID0gbmV3IEFwcCh7XG4gICAgcGF0aDogcmVxLnBhdGgsXG4gICAgb25TZXRUaXRsZTogZnVuY3Rpb24odGl0bGUpIHsgZGF0YS50aXRsZSA9IHRpdGxlOyB9LFxuICAgIG9uU2V0TWV0YTogZnVuY3Rpb24obmFtZSwgY29udGVudCkgeyBkYXRhW25hbWVdID0gY29udGVudDsgfSxcbiAgICBvblBhZ2VOb3RGb3VuZDogZnVuY3Rpb24oKSB7IHJlcy5zdGF0dXMoNDA0KTsgfVxuICB9KTtcbiAgZGF0YS5ib2R5ID0gUmVhY3QucmVuZGVyVG9TdHJpbmcoYXBwKTtcbiAgdmFyIGh0bWwgPSB0ZW1wbGF0ZShkYXRhKTtcbiAgcmVzLnNlbmQoaHRtbCk7XG59KTtcblxuLy8gTG9hZCBwYWdlcyBmcm9tIHRoZSBgL3NyYy9jb250ZW50L2AgZm9sZGVyIGludG8gdGhlIEFwcFN0b3JlXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBhc3NpZ24gPSByZXF1aXJlKCdyZWFjdC9saWIvT2JqZWN0LmFzc2lnbicpO1xuICB2YXIgZm0gPSByZXF1aXJlKCdmcm9udC1tYXR0ZXInKTtcbiAgdmFyIGphZGUgPSByZXF1aXJlKCdqYWRlJyk7XG4gIHZhciBzb3VyY2VEaXIgPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi9jb250ZW50Jyk7XG4gIHZhciBnZXRGaWxlcyA9IGZ1bmN0aW9uKGRpcikge1xuICAgIHZhciBwYWdlcyA9IFtdO1xuICAgIGZzLnJlYWRkaXJTeW5jKGRpcikuZm9yRWFjaChmdW5jdGlvbihmaWxlKSB7XG4gICAgICB2YXIgc3RhdCA9IGZzLnN0YXRTeW5jKHBhdGguam9pbihkaXIsIGZpbGUpKTtcbiAgICAgIGlmIChzdGF0ICYmIHN0YXQuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICBwYWdlcyA9IHBhZ2VzLmNvbmNhdChnZXRGaWxlcyhmaWxlKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBDb252ZXJ0IHRoZSBmaWxlIHRvIGEgUGFnZSBvYmplY3RcbiAgICAgICAgdmFyIGZpbGVuYW1lID0gcGF0aC5qb2luKGRpciwgZmlsZSk7XG4gICAgICAgIHZhciB1cmwgPSBmaWxlbmFtZS5cbiAgICAgICAgICBzdWJzdHIoc291cmNlRGlyLmxlbmd0aCwgZmlsZW5hbWUubGVuZ3RoIC0gc291cmNlRGlyLmxlbmd0aCAtIDUpXG4gICAgICAgICAgLnJlcGxhY2UoJ1xcXFwnLCAnLycpO1xuICAgICAgICBpZiAodXJsLmluZGV4T2YoJy9pbmRleCcsIHVybC5sZW5ndGggLSA2KSAhPT0gLTEpIHtcbiAgICAgICAgICB1cmwgPSB1cmwuc3Vic3RyKDAsIHVybC5sZW5ndGggLSAodXJsLmxlbmd0aCA+IDYgPyA2IDogNSkpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBzb3VyY2UgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZW5hbWUsICd1dGY4Jyk7XG4gICAgICAgIHZhciBjb250ZW50ID0gZm0oc291cmNlKTtcbiAgICAgICAgdmFyIGh0bWwgPSBqYWRlLnJlbmRlcihjb250ZW50LmJvZHksIG51bGwsICcgICcpO1xuICAgICAgICB2YXIgcGFnZSA9IGFzc2lnbih7fSwge3BhdGg6IHVybCwgYm9keTogaHRtbH0sIGNvbnRlbnQuYXR0cmlidXRlcyk7XG4gICAgICAgIERpc3BhdGNoZXIuaGFuZGxlU2VydmVyQWN0aW9uKHtcbiAgICAgICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlcy5MT0FEX1BBR0UsXG4gICAgICAgICAgcGF0aDogdXJsLFxuICAgICAgICAgIHBhZ2U6IHBhZ2VcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHBhZ2VzO1xuICB9O1xuICByZXR1cm4gZ2V0RmlsZXMoc291cmNlRGlyKTtcbn0pKCk7XG5cbnNlcnZlci5saXN0ZW4oc2VydmVyLmdldCgncG9ydCcpLCBmdW5jdGlvbigpIHtcbiAgaWYgKHByb2Nlc3Muc2VuZCkge1xuICAgIHByb2Nlc3Muc2VuZCgnb25saW5lJyk7XG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5sb2coJ1RoZSBzZXJ2ZXIgaXMgcnVubmluZyBhdCBodHRwOi8vbG9jYWxob3N0OicgKyBzZXJ2ZXIuZ2V0KCdwb3J0JykpO1xuICB9XG59KTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vfi9qc2hpbnQtbG9hZGVyIS4vc3JjL3NlcnZlci5qc1xuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInJlYWN0XCIpO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogZXh0ZXJuYWwgXCJyZWFjdFwiXG4gKiogbW9kdWxlIGlkID0gMVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLypcbiAqIFJlYWN0LmpzIFN0YXJ0ZXIgS2l0XG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQgS29uc3RhbnRpbiBUYXJrdXMgKEBrb2lzdHlhKSwgS3JpYVNvZnQgTExDLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRS50eHQgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmltcG9ydCBrZXlNaXJyb3IgZnJvbSAncmVhY3QvbGliL2tleU1pcnJvcic7XG5cbnZhciBBY3Rpb25UeXBlcyA9IGtleU1pcnJvcih7XG5cbiAgTE9BRF9QQUdFOiBudWxsLFxuICBMT0FEX1BBR0VfU1VDQ0VTUzogbnVsbCxcbiAgTE9BRF9QQUdFX0VSUk9SOiBudWxsLFxuICBDSEFOR0VfTE9DQVRJT046IG51bGxcblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQWN0aW9uVHlwZXM7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL34vanNoaW50LWxvYWRlciEuL3NyYy9jb25zdGFudHMvQWN0aW9uVHlwZXMuanNcbiAqKi8iLCIvKlxuICogUmVhY3QuanMgU3RhcnRlciBLaXRcbiAqIENvcHlyaWdodCAoYykgMjAxNCBLb25zdGFudGluIFRhcmt1cyAoQGtvaXN0eWEpLCBLcmlhU29mdCBMTEMuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFLnR4dCBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IEZsdXggZnJvbSAnZmx1eCc7XG5pbXBvcnQgUGF5bG9hZFNvdXJjZXMgZnJvbSAnLi4vY29uc3RhbnRzL1BheWxvYWRTb3VyY2VzJztcbmltcG9ydCBhc3NpZ24gZnJvbSAncmVhY3QvbGliL09iamVjdC5hc3NpZ24nO1xuXG4vKipcbiAqIEEgc2luZ2xldG9uIHRoYXQgb3BlcmF0ZXMgYXMgdGhlIGNlbnRyYWwgaHViIGZvciBhcHBsaWNhdGlvbiB1cGRhdGVzLlxuICogRm9yIG1vcmUgaW5mb3JtYXRpb24gdmlzaXQgaHR0cHM6Ly9mYWNlYm9vay5naXRodWIuaW8vZmx1eC9cbiAqL1xudmFyIERpc3BhdGNoZXIgPSBhc3NpZ24obmV3IEZsdXguRGlzcGF0Y2hlcigpLCB7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBhY3Rpb24gVGhlIGRldGFpbHMgb2YgdGhlIGFjdGlvbiwgaW5jbHVkaW5nIHRoZSBhY3Rpb24nc1xuICAgKiB0eXBlIGFuZCBhZGRpdGlvbmFsIGRhdGEgY29taW5nIGZyb20gdGhlIHNlcnZlci5cbiAgICovXG4gIGhhbmRsZVNlcnZlckFjdGlvbihhY3Rpb24pIHtcbiAgICB2YXIgcGF5bG9hZCA9IHtcbiAgICAgIHNvdXJjZTogUGF5bG9hZFNvdXJjZXMuU0VSVkVSX0FDVElPTixcbiAgICAgIGFjdGlvbjogYWN0aW9uXG4gICAgfTtcbiAgICB0aGlzLmRpc3BhdGNoKHBheWxvYWQpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge29iamVjdH0gYWN0aW9uIFRoZSBkZXRhaWxzIG9mIHRoZSBhY3Rpb24sIGluY2x1ZGluZyB0aGUgYWN0aW9uJ3NcbiAgICogdHlwZSBhbmQgYWRkaXRpb25hbCBkYXRhIGNvbWluZyBmcm9tIHRoZSB2aWV3LlxuICAgKi9cbiAgaGFuZGxlVmlld0FjdGlvbihhY3Rpb24pIHtcbiAgICB2YXIgcGF5bG9hZCA9IHtcbiAgICAgIHNvdXJjZTogUGF5bG9hZFNvdXJjZXMuVklFV19BQ1RJT04sXG4gICAgICBhY3Rpb246IGFjdGlvblxuICAgIH07XG4gICAgdGhpcy5kaXNwYXRjaChwYXlsb2FkKTtcbiAgfVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBEaXNwYXRjaGVyO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9+L2pzaGludC1sb2FkZXIhLi9zcmMvY29yZS9EaXNwYXRjaGVyLmpzXG4gKiovIiwiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgQlNELXN0eWxlIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuIEFuIGFkZGl0aW9uYWwgZ3JhbnRcbiAqIG9mIHBhdGVudCByaWdodHMgY2FuIGJlIGZvdW5kIGluIHRoZSBQQVRFTlRTIGZpbGUgaW4gdGhlIHNhbWUgZGlyZWN0b3J5LlxuICpcbiAqIEBwcm92aWRlc01vZHVsZSBPYmplY3QuYXNzaWduXG4gKi9cblxuLy8gaHR0cHM6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLW9iamVjdC5hc3NpZ25cblxuZnVuY3Rpb24gYXNzaWduKHRhcmdldCwgc291cmNlcykge1xuICBpZiAodGFyZ2V0ID09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdPYmplY3QuYXNzaWduIHRhcmdldCBjYW5ub3QgYmUgbnVsbCBvciB1bmRlZmluZWQnKTtcbiAgfVxuXG4gIHZhciB0byA9IE9iamVjdCh0YXJnZXQpO1xuICB2YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG4gIGZvciAodmFyIG5leHRJbmRleCA9IDE7IG5leHRJbmRleCA8IGFyZ3VtZW50cy5sZW5ndGg7IG5leHRJbmRleCsrKSB7XG4gICAgdmFyIG5leHRTb3VyY2UgPSBhcmd1bWVudHNbbmV4dEluZGV4XTtcbiAgICBpZiAobmV4dFNvdXJjZSA9PSBudWxsKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICB2YXIgZnJvbSA9IE9iamVjdChuZXh0U291cmNlKTtcblxuICAgIC8vIFdlIGRvbid0IGN1cnJlbnRseSBzdXBwb3J0IGFjY2Vzc29ycyBub3IgcHJveGllcy4gVGhlcmVmb3JlIHRoaXNcbiAgICAvLyBjb3B5IGNhbm5vdCB0aHJvdy4gSWYgd2UgZXZlciBzdXBwb3J0ZWQgdGhpcyB0aGVuIHdlIG11c3QgaGFuZGxlXG4gICAgLy8gZXhjZXB0aW9ucyBhbmQgc2lkZS1lZmZlY3RzLiBXZSBkb24ndCBzdXBwb3J0IHN5bWJvbHMgc28gdGhleSB3b24ndFxuICAgIC8vIGJlIHRyYW5zZmVycmVkLlxuXG4gICAgZm9yICh2YXIga2V5IGluIGZyb20pIHtcbiAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKGZyb20sIGtleSkpIHtcbiAgICAgICAgdG9ba2V5XSA9IGZyb21ba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdG87XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFzc2lnbjtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L3JlYWN0L2xpYi9PYmplY3QuYXNzaWduLmpzXG4gKiogbW9kdWxlIGlkID0gNFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLypcbiAqIFJlYWN0LmpzIFN0YXJ0ZXIgS2l0XG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQgS29uc3RhbnRpbiBUYXJrdXMgKEBrb2lzdHlhKSwgS3JpYVNvZnQgTExDLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRS50eHQgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmltcG9ydCBEaXNwYXRjaGVyIGZyb20gJy4uL2NvcmUvRGlzcGF0Y2hlcic7XG5pbXBvcnQgQWN0aW9uVHlwZXMgZnJvbSAnLi4vY29uc3RhbnRzL0FjdGlvblR5cGVzJztcbmltcG9ydCBFeGVjdXRpb25FbnZpcm9ubWVudCBmcm9tICdyZWFjdC9saWIvRXhlY3V0aW9uRW52aXJvbm1lbnQnO1xuaW1wb3J0IGh0dHAgZnJvbSAnc3VwZXJhZ2VudCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIG5hdmlnYXRlVG8ocGF0aCkge1xuICAgIGlmIChFeGVjdXRpb25FbnZpcm9ubWVudC5jYW5Vc2VET00pIHtcbiAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSh7fSwgZG9jdW1lbnQudGl0bGUsIHBhdGgpO1xuICAgIH1cblxuICAgIERpc3BhdGNoZXIuaGFuZGxlVmlld0FjdGlvbih7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlcy5DSEFOR0VfTE9DQVRJT04sIHBhdGg6IHBhdGhcbiAgICB9KTtcbiAgfSxcblxuICBsb2FkUGFnZShwYXRoLCBjYikge1xuICAgIERpc3BhdGNoZXIuaGFuZGxlVmlld0FjdGlvbih7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlcy5MT0FEX1BBR0UsIHBhdGg6IHBhdGhcbiAgICB9KTtcblxuICAgIGh0dHAuZ2V0KCcvYXBpL3BhZ2UnICsgcGF0aClcbiAgICAgIC5hY2NlcHQoJ2FwcGxpY2F0aW9uL2pzb24nKVxuICAgICAgLmVuZCgoZXJyLCByZXMpID0+IHtcbiAgICAgICAgRGlzcGF0Y2hlci5oYW5kbGVTZXJ2ZXJBY3Rpb24oe1xuICAgICAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGVzLkxPQURfUEFHRSwgcGF0aDogcGF0aCwgZXJyOiBlcnIsIHBhZ2U6IHJlcy5ib2R5XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoY2IpIHtcbiAgICAgICAgICBjYigpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfVxuXG59O1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9+L2pzaGludC1sb2FkZXIhLi9zcmMvYWN0aW9ucy9BcHBBY3Rpb25zLmpzXG4gKiovIiwiLypcbiAqIFJlYWN0LmpzIFN0YXJ0ZXIgS2l0XG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQgS29uc3RhbnRpbiBUYXJrdXMgKEBrb2lzdHlhKSwgS3JpYVNvZnQgTExDLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRS50eHQgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmltcG9ydCBrZXlNaXJyb3IgZnJvbSAncmVhY3QvbGliL2tleU1pcnJvcic7XG5cbnZhciBQYXlsb2FkU291cmNlcyA9IGtleU1pcnJvcih7XG5cbiAgVklFV19BQ1RJT046IG51bGwsXG4gIFNFUlZFUl9BQ1RJT046IG51bGxcblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUGF5bG9hZFNvdXJjZXM7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL34vanNoaW50LWxvYWRlciEuL3NyYy9jb25zdGFudHMvUGF5bG9hZFNvdXJjZXMuanNcbiAqKi8iLCIvKlxuICogUmVhY3QuanMgU3RhcnRlciBLaXRcbiAqIENvcHlyaWdodCAoYykgMjAxNCBLb25zdGFudGluIFRhcmt1cyAoQGtvaXN0eWEpLCBLcmlhU29mdCBMTEMuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFLnR4dCBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IERpc3BhdGNoZXIgZnJvbSAnLi4vY29yZS9EaXNwYXRjaGVyJztcbmltcG9ydCBBY3Rpb25UeXBlcyBmcm9tICcuLi9jb25zdGFudHMvQWN0aW9uVHlwZXMnO1xuaW1wb3J0IFBheWxvYWRTb3VyY2VzIGZyb20gJy4uL2NvbnN0YW50cy9QYXlsb2FkU291cmNlcyc7XG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJ2V2ZW50ZW1pdHRlcjMnO1xuaW1wb3J0IGFzc2lnbiBmcm9tICdyZWFjdC9saWIvT2JqZWN0LmFzc2lnbic7XG5cbnZhciBDSEFOR0VfRVZFTlQgPSAnY2hhbmdlJztcblxudmFyIF9wYWdlcyA9IHt9O1xudmFyIF9sb2FkaW5nID0gZmFsc2U7XG5cbmlmIChfX1NFUlZFUl9fKSB7XG4gIF9wYWdlc1snLyddID0ge3RpdGxlOiAnSG9tZSBQYWdlJ307XG4gIF9wYWdlc1snL3ByaXZhY3knXSA9IHt0aXRsZTogJ1ByaXZhY3kgUG9saWN5J307XG59XG5cbnZhciBBcHBTdG9yZSA9IGFzc2lnbih7fSwgRXZlbnRFbWl0dGVyLnByb3RvdHlwZSwge1xuXG4gIC8qKlxuICAgKiBHZXRzIHBhZ2UgZGF0YSBieSB0aGUgZ2l2ZW4gVVJMIHBhdGguXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIFVSTCBwYXRoLlxuICAgKiBAcmV0dXJucyB7Kn0gUGFnZSBkYXRhLlxuICAgKi9cbiAgZ2V0UGFnZShwYXRoKSB7XG4gICAgcmV0dXJuIHBhdGggaW4gX3BhZ2VzID8gX3BhZ2VzW3BhdGhdIDoge1xuICAgICAgdGl0bGU6ICdQYWdlIE5vdCBGb3VuZCcsXG4gICAgICB0eXBlOiAnbm90Zm91bmQnXG4gICAgfTtcbiAgfSxcblxuICAvKipcbiAgICogRW1pdHMgY2hhbmdlIGV2ZW50IHRvIGFsbCByZWdpc3RlcmVkIGV2ZW50IGxpc3RlbmVycy5cbiAgICpcbiAgICogQHJldHVybnMge0Jvb2xlYW59IEluZGljYXRpb24gaWYgd2UndmUgZW1pdHRlZCBhbiBldmVudC5cbiAgICovXG4gIGVtaXRDaGFuZ2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdChDSEFOR0VfRVZFTlQpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBhIG5ldyBjaGFuZ2UgZXZlbnQgbGlzdGVuZXIuXG4gICAqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIENhbGxiYWNrIGZ1bmN0aW9uLlxuICAgKi9cbiAgb25DaGFuZ2UoY2FsbGJhY2spIHtcbiAgICB0aGlzLm9uKENIQU5HRV9FVkVOVCwgY2FsbGJhY2spO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZW1vdmUgY2hhbmdlIGV2ZW50IGxpc3RlbmVyLlxuICAgKlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayBDYWxsYmFjayBmdW5jdGlvbi5cbiAgICovXG4gIG9mZihjYWxsYmFjaykge1xuICAgIHRoaXMub2ZmKENIQU5HRV9FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbn0pO1xuXG5BcHBTdG9yZS5kaXNwYXRjaGVyVG9rZW4gPSBEaXNwYXRjaGVyLnJlZ2lzdGVyKChwYXlsb2FkKSA9PiB7XG4gIHZhciBhY3Rpb24gPSBwYXlsb2FkLmFjdGlvbjtcblxuICBzd2l0Y2ggKGFjdGlvbi5hY3Rpb25UeXBlKSB7XG5cbiAgICBjYXNlIEFjdGlvblR5cGVzLkxPQURfUEFHRTpcbiAgICAgIGlmIChhY3Rpb24uc291cmNlID09PSBQYXlsb2FkU291cmNlcy5WSUVXX0FDVElPTikge1xuICAgICAgICBfbG9hZGluZyA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoIWFjdGlvbi5lcnIpIHtcbiAgICAgICAgICBfcGFnZXNbYWN0aW9uLnBhdGhdID0gYWN0aW9uLnBhZ2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIEFwcFN0b3JlLmVtaXRDaGFuZ2UoKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIC8vIERvIG5vdGhpbmdcblxuICB9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcFN0b3JlO1xuXG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL34vanNoaW50LWxvYWRlciEuL3NyYy9zdG9yZXMvQXBwU3RvcmUuanNcbiAqKi8iLCIvKipcbiAqIENvcHlyaWdodCAyMDEzLTIwMTQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLiBBbiBhZGRpdGlvbmFsIGdyYW50XG4gKiBvZiBwYXRlbnQgcmlnaHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUgUEFURU5UUyBmaWxlIGluIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAqXG4gKiBAcHJvdmlkZXNNb2R1bGUgRXhlY3V0aW9uRW52aXJvbm1lbnRcbiAqL1xuXG4vKmpzbGludCBldmlsOiB0cnVlICovXG5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgY2FuVXNlRE9NID0gISEoXG4gIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmXG4gIHdpbmRvdy5kb2N1bWVudCAmJlxuICB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudFxuKTtcblxuLyoqXG4gKiBTaW1wbGUsIGxpZ2h0d2VpZ2h0IG1vZHVsZSBhc3Npc3Rpbmcgd2l0aCB0aGUgZGV0ZWN0aW9uIGFuZCBjb250ZXh0IG9mXG4gKiBXb3JrZXIuIEhlbHBzIGF2b2lkIGNpcmN1bGFyIGRlcGVuZGVuY2llcyBhbmQgYWxsb3dzIGNvZGUgdG8gcmVhc29uIGFib3V0XG4gKiB3aGV0aGVyIG9yIG5vdCB0aGV5IGFyZSBpbiBhIFdvcmtlciwgZXZlbiBpZiB0aGV5IG5ldmVyIGluY2x1ZGUgdGhlIG1haW5cbiAqIGBSZWFjdFdvcmtlcmAgZGVwZW5kZW5jeS5cbiAqL1xudmFyIEV4ZWN1dGlvbkVudmlyb25tZW50ID0ge1xuXG4gIGNhblVzZURPTTogY2FuVXNlRE9NLFxuXG4gIGNhblVzZVdvcmtlcnM6IHR5cGVvZiBXb3JrZXIgIT09ICd1bmRlZmluZWQnLFxuXG4gIGNhblVzZUV2ZW50TGlzdGVuZXJzOlxuICAgIGNhblVzZURPTSAmJiAhISh3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciB8fCB3aW5kb3cuYXR0YWNoRXZlbnQpLFxuXG4gIGNhblVzZVZpZXdwb3J0OiBjYW5Vc2VET00gJiYgISF3aW5kb3cuc2NyZWVuLFxuXG4gIGlzSW5Xb3JrZXI6ICFjYW5Vc2VET00gLy8gRm9yIG5vdywgdGhpcyBpcyB0cnVlIC0gbWlnaHQgY2hhbmdlIGluIHRoZSBmdXR1cmUuXG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRXhlY3V0aW9uRW52aXJvbm1lbnQ7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9yZWFjdC9saWIvRXhlY3V0aW9uRW52aXJvbm1lbnQuanNcbiAqKiBtb2R1bGUgaWQgPSA4XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvKipcbiAqIENvcHlyaWdodCAyMDEzLTIwMTQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLiBBbiBhZGRpdGlvbmFsIGdyYW50XG4gKiBvZiBwYXRlbnQgcmlnaHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUgUEFURU5UUyBmaWxlIGluIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAqXG4gKiBAcHJvdmlkZXNNb2R1bGUgaW52YXJpYW50XG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogVXNlIGludmFyaWFudCgpIHRvIGFzc2VydCBzdGF0ZSB3aGljaCB5b3VyIHByb2dyYW0gYXNzdW1lcyB0byBiZSB0cnVlLlxuICpcbiAqIFByb3ZpZGUgc3ByaW50Zi1zdHlsZSBmb3JtYXQgKG9ubHkgJXMgaXMgc3VwcG9ydGVkKSBhbmQgYXJndW1lbnRzXG4gKiB0byBwcm92aWRlIGluZm9ybWF0aW9uIGFib3V0IHdoYXQgYnJva2UgYW5kIHdoYXQgeW91IHdlcmVcbiAqIGV4cGVjdGluZy5cbiAqXG4gKiBUaGUgaW52YXJpYW50IG1lc3NhZ2Ugd2lsbCBiZSBzdHJpcHBlZCBpbiBwcm9kdWN0aW9uLCBidXQgdGhlIGludmFyaWFudFxuICogd2lsbCByZW1haW4gdG8gZW5zdXJlIGxvZ2ljIGRvZXMgbm90IGRpZmZlciBpbiBwcm9kdWN0aW9uLlxuICovXG5cbnZhciBpbnZhcmlhbnQgPSBmdW5jdGlvbihjb25kaXRpb24sIGZvcm1hdCwgYSwgYiwgYywgZCwgZSwgZikge1xuICBpZiAoXCJwcm9kdWN0aW9uXCIgIT09IHByb2Nlc3MuZW52Lk5PREVfRU5WKSB7XG4gICAgaWYgKGZvcm1hdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFyaWFudCByZXF1aXJlcyBhbiBlcnJvciBtZXNzYWdlIGFyZ3VtZW50Jyk7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFjb25kaXRpb24pIHtcbiAgICB2YXIgZXJyb3I7XG4gICAgaWYgKGZvcm1hdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBlcnJvciA9IG5ldyBFcnJvcihcbiAgICAgICAgJ01pbmlmaWVkIGV4Y2VwdGlvbiBvY2N1cnJlZDsgdXNlIHRoZSBub24tbWluaWZpZWQgZGV2IGVudmlyb25tZW50ICcgK1xuICAgICAgICAnZm9yIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2UgYW5kIGFkZGl0aW9uYWwgaGVscGZ1bCB3YXJuaW5ncy4nXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgYXJncyA9IFthLCBiLCBjLCBkLCBlLCBmXTtcbiAgICAgIHZhciBhcmdJbmRleCA9IDA7XG4gICAgICBlcnJvciA9IG5ldyBFcnJvcihcbiAgICAgICAgJ0ludmFyaWFudCBWaW9sYXRpb246ICcgK1xuICAgICAgICBmb3JtYXQucmVwbGFjZSgvJXMvZywgZnVuY3Rpb24oKSB7IHJldHVybiBhcmdzW2FyZ0luZGV4KytdOyB9KVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBlcnJvci5mcmFtZXNUb1BvcCA9IDE7IC8vIHdlIGRvbid0IGNhcmUgYWJvdXQgaW52YXJpYW50J3Mgb3duIGZyYW1lXG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gaW52YXJpYW50O1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vcmVhY3QvbGliL2ludmFyaWFudC5qc1xuICoqIG1vZHVsZSBpZCA9IDlcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8qKlxuICogQ29weXJpZ2h0IDIwMTMtMjAxNCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgQlNELXN0eWxlIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuIEFuIGFkZGl0aW9uYWwgZ3JhbnRcbiAqIG9mIHBhdGVudCByaWdodHMgY2FuIGJlIGZvdW5kIGluIHRoZSBQQVRFTlRTIGZpbGUgaW4gdGhlIHNhbWUgZGlyZWN0b3J5LlxuICpcbiAqIEBwcm92aWRlc01vZHVsZSBrZXlNaXJyb3JcbiAqIEB0eXBlY2hlY2tzIHN0YXRpYy1vbmx5XG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBpbnZhcmlhbnQgPSByZXF1aXJlKFwiLi9pbnZhcmlhbnRcIik7XG5cbi8qKlxuICogQ29uc3RydWN0cyBhbiBlbnVtZXJhdGlvbiB3aXRoIGtleXMgZXF1YWwgdG8gdGhlaXIgdmFsdWUuXG4gKlxuICogRm9yIGV4YW1wbGU6XG4gKlxuICogICB2YXIgQ09MT1JTID0ga2V5TWlycm9yKHtibHVlOiBudWxsLCByZWQ6IG51bGx9KTtcbiAqICAgdmFyIG15Q29sb3IgPSBDT0xPUlMuYmx1ZTtcbiAqICAgdmFyIGlzQ29sb3JWYWxpZCA9ICEhQ09MT1JTW215Q29sb3JdO1xuICpcbiAqIFRoZSBsYXN0IGxpbmUgY291bGQgbm90IGJlIHBlcmZvcm1lZCBpZiB0aGUgdmFsdWVzIG9mIHRoZSBnZW5lcmF0ZWQgZW51bSB3ZXJlXG4gKiBub3QgZXF1YWwgdG8gdGhlaXIga2V5cy5cbiAqXG4gKiAgIElucHV0OiAge2tleTE6IHZhbDEsIGtleTI6IHZhbDJ9XG4gKiAgIE91dHB1dDoge2tleTE6IGtleTEsIGtleTI6IGtleTJ9XG4gKlxuICogQHBhcmFtIHtvYmplY3R9IG9ialxuICogQHJldHVybiB7b2JqZWN0fVxuICovXG52YXIga2V5TWlycm9yID0gZnVuY3Rpb24ob2JqKSB7XG4gIHZhciByZXQgPSB7fTtcbiAgdmFyIGtleTtcbiAgKFwicHJvZHVjdGlvblwiICE9PSBwcm9jZXNzLmVudi5OT0RFX0VOViA/IGludmFyaWFudChcbiAgICBvYmogaW5zdGFuY2VvZiBPYmplY3QgJiYgIUFycmF5LmlzQXJyYXkob2JqKSxcbiAgICAna2V5TWlycm9yKC4uLik6IEFyZ3VtZW50IG11c3QgYmUgYW4gb2JqZWN0LidcbiAgKSA6IGludmFyaWFudChvYmogaW5zdGFuY2VvZiBPYmplY3QgJiYgIUFycmF5LmlzQXJyYXkob2JqKSkpO1xuICBmb3IgKGtleSBpbiBvYmopIHtcbiAgICBpZiAoIW9iai5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgcmV0W2tleV0gPSBrZXk7XG4gIH1cbiAgcmV0dXJuIHJldDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ga2V5TWlycm9yO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vcmVhY3QvbGliL2tleU1pcnJvci5qc1xuICoqIG1vZHVsZSBpZCA9IDEwXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvKlxuICogUmVhY3QuanMgU3RhcnRlciBLaXRcbiAqIENvcHlyaWdodCAoYykgMjAxNCBLb25zdGFudGluIFRhcmt1cyAoQGtvaXN0eWEpLCBLcmlhU29mdCBMTEMuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFLnR4dCBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuaW1wb3J0ICcuL0FwcC5sZXNzJztcblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAncmVhY3QvbGliL2ludmFyaWFudCc7XG5pbXBvcnQgQXBwQWN0aW9ucyBmcm9tICcuLi8uLi9hY3Rpb25zL0FwcEFjdGlvbnMnO1xuaW1wb3J0IE5hdmlnYXRpb25NaXhpbiBmcm9tICcuL05hdmlnYXRpb25NaXhpbic7XG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnLi4vLi4vc3RvcmVzL0FwcFN0b3JlJztcbmltcG9ydCBOYXZiYXIgZnJvbSAnLi4vTmF2YmFyJztcbmltcG9ydCBDb250ZW50UGFnZSBmcm9tICcuLi9Db250ZW50UGFnZSc7XG5pbXBvcnQgTm90Rm91bmRQYWdlIGZyb20gJy4uL05vdEZvdW5kUGFnZSc7XG5cbmV4cG9ydCBkZWZhdWx0IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBtaXhpbnM6IFtOYXZpZ2F0aW9uTWl4aW5dLFxuXG4gIHByb3BUeXBlczoge1xuICAgIHBhdGg6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICBvblNldFRpdGxlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIG9uU2V0TWV0YTogUmVhY3QuUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBvblBhZ2VOb3RGb3VuZDogUmVhY3QuUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZFxuICB9LFxuXG4gIHJlbmRlcigpIHtcbiAgICB2YXIgcGFnZSA9IEFwcFN0b3JlLmdldFBhZ2UodGhpcy5wcm9wcy5wYXRoKTtcbiAgICBpbnZhcmlhbnQocGFnZSAhPT0gdW5kZWZpbmVkLCAnRmFpbGVkIHRvIGxvYWQgcGFnZSBjb250ZW50LicpO1xuICAgIHRoaXMucHJvcHMub25TZXRUaXRsZShwYWdlLnRpdGxlKTtcblxuICAgIGlmIChwYWdlLnR5cGUgPT09ICdub3Rmb3VuZCcpIHtcbiAgICAgIHRoaXMucHJvcHMub25QYWdlTm90Rm91bmQoKTtcbiAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KE5vdEZvdW5kUGFnZSwgcGFnZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIC8qIGpzaGludCBpZ25vcmU6c3RhcnQgKi9cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiQXBwXCI+XG4gICAgICAgIDxOYXZiYXIgLz5cbiAgICAgICAge1xuICAgICAgICAgIHRoaXMucHJvcHMucGF0aCA9PT0gJy8nID9cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImp1bWJvdHJvblwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb250YWluZXIgdGV4dC1jZW50ZXJcIj5cbiAgICAgICAgICAgICAgPGgxPlJlYWN0PC9oMT5cbiAgICAgICAgICAgICAgPHA+Q29tcGxleCB3ZWIgYXBwcyBtYWRlIGVhc3k8L3A+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj4gOlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29udGFpbmVyXCI+XG4gICAgICAgICAgICA8aDI+e3BhZ2UudGl0bGV9PC9oMj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgfVxuICAgICAgICA8Q29udGVudFBhZ2UgY2xhc3NOYW1lPVwiY29udGFpbmVyXCIgey4uLnBhZ2V9IC8+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibmF2YmFyLWZvb3RlclwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29udGFpbmVyXCI+XG4gICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LW11dGVkXCI+XG4gICAgICAgICAgICAgIDxzcGFuPsKpIEtyaWFTb2Z0PC9zcGFuPlxuICAgICAgICAgICAgICA8c3Bhbj48YSBocmVmPVwiL1wiPkhvbWU8L2E+PC9zcGFuPlxuICAgICAgICAgICAgICA8c3Bhbj48YSBocmVmPVwiL3ByaXZhY3lcIj5Qcml2YWN5PC9hPjwvc3Bhbj5cbiAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICAgIC8qIGpzaGludCBpZ25vcmU6ZW5kICovXG4gICAgKTtcbiAgfVxuXG59KTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vfi9qc2hpbnQtbG9hZGVyIS4vc3JjL2NvbXBvbmVudHMvQXBwL0FwcC5qc1xuICoqLyIsIi8qXG4gKiBSZWFjdC5qcyBTdGFydGVyIEtpdFxuICogQ29weXJpZ2h0IChjKSAyMDE0IEtvbnN0YW50aW4gVGFya3VzIChAa29pc3R5YSksIEtyaWFTb2Z0IExMQy5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UudHh0IGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IEV4ZWN1dGlvbkVudmlyb25tZW50IGZyb20gJ3JlYWN0L2xpYi9FeGVjdXRpb25FbnZpcm9ubWVudCc7XG5pbXBvcnQgQXBwQWN0aW9ucyBmcm9tICcuLi8uLi9hY3Rpb25zL0FwcEFjdGlvbnMnO1xuXG52YXIgTmF2aWdhdGlvbk1peGluID0ge1xuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIGlmIChFeGVjdXRpb25FbnZpcm9ubWVudC5jYW5Vc2VET00pIHtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdwb3BzdGF0ZScsIHRoaXMuaGFuZGxlUG9wU3RhdGUpO1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5oYW5kbGVDbGljayk7XG4gICAgfVxuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdwb3BzdGF0ZScsIHRoaXMuaGFuZGxlUG9wU3RhdGUpO1xuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuaGFuZGxlQ2xpY2spO1xuICB9LFxuXG4gIGhhbmRsZVBvcFN0YXRlKGV2ZW50KSB7XG4gICAgY29uc29sZS5sb2coZXZlbnQpO1xuICAgIGlmIChldmVudC5zdGF0ZSkge1xuICAgICAgdmFyIHBhdGggPSBldmVudC5zdGF0ZS5wYXRoO1xuICAgICAgLy8gVE9ETzogUmVwbGFjZSBjdXJyZW50IGxvY2F0aW9uXG4gICAgICAvLyByZXBsYWNlKHBhdGgsIGV2ZW50LnN0YXRlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgQXBwQWN0aW9ucy5uYXZpZ2F0ZVRvKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSk7XG4gICAgfVxuICB9LFxuXG4gIGhhbmRsZUNsaWNrKGV2ZW50KSB7XG4gICAgaWYgKGV2ZW50LmJ1dHRvbiA9PT0gMSB8fCBldmVudC5tZXRhS2V5IHx8IGV2ZW50LmN0cmxLZXkgfHwgZXZlbnQuc2hpZnRLZXkgfHwgZXZlbnQuZGVmYXVsdFByZXZlbnRlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEVuc3VyZSBsaW5rXG4gICAgdmFyIGVsID0gZXZlbnQudGFyZ2V0O1xuICAgIHdoaWxlIChlbCAmJiBlbC5ub2RlTmFtZSAhPT0gJ0EnKSB7XG4gICAgICBlbCA9IGVsLnBhcmVudE5vZGU7XG4gICAgfVxuICAgIGlmICghZWwgfHwgZWwubm9kZU5hbWUgIT09ICdBJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIElnbm9yZSBpZiB0YWcgaGFzXG4gICAgLy8gMS4gXCJkb3dubG9hZFwiIGF0dHJpYnV0ZVxuICAgIC8vIDIuIHJlbD1cImV4dGVybmFsXCIgYXR0cmlidXRlXG4gICAgaWYgKGVsLmdldEF0dHJpYnV0ZSgnZG93bmxvYWQnKSB8fCBlbC5nZXRBdHRyaWJ1dGUoJ3JlbCcpID09PSAnZXh0ZXJuYWwnKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gRW5zdXJlIG5vbi1oYXNoIGZvciB0aGUgc2FtZSBwYXRoXG4gICAgdmFyIGxpbmsgPSBlbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcbiAgICBpZiAoZWwucGF0aG5hbWUgPT09IGxvY2F0aW9uLnBhdGhuYW1lICYmIChlbC5oYXNoIHx8ICcjJyA9PT0gbGluaykpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBmb3IgbWFpbHRvOiBpbiB0aGUgaHJlZlxuICAgIGlmIChsaW5rICYmIGxpbmsuaW5kZXhPZignbWFpbHRvOicpID4gLTEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBDaGVjayB0YXJnZXRcbiAgICBpZiAoZWwudGFyZ2V0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gWC1vcmlnaW5cbiAgICB2YXIgb3JpZ2luID0gd2luZG93LmxvY2F0aW9uLnByb3RvY29sICsgJy8vJyArIHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSArXG4gICAgICAod2luZG93LmxvY2F0aW9uLnBvcnQgPyAnOicgKyB3aW5kb3cubG9jYXRpb24ucG9ydCA6ICcnKTtcbiAgICBpZiAoIShlbC5ocmVmICYmIGVsLmhyZWYuaW5kZXhPZihvcmlnaW4pID09PSAwKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFJlYnVpbGQgcGF0aFxuICAgIHZhciBwYXRoID0gZWwucGF0aG5hbWUgKyBlbC5zZWFyY2ggKyAoZWwuaGFzaCB8fCAnJyk7XG5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIEFwcEFjdGlvbnMubG9hZFBhZ2UocGF0aCwgKCkgPT4ge1xuICAgICAgQXBwQWN0aW9ucy5uYXZpZ2F0ZVRvKHBhdGgpO1xuICAgIH0pO1xuICB9XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTmF2aWdhdGlvbk1peGluO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9+L2pzaGludC1sb2FkZXIhLi9zcmMvY29tcG9uZW50cy9BcHAvTmF2aWdhdGlvbk1peGluLmpzXG4gKiovIiwiLypcbiAqIFJlYWN0LmpzIFN0YXJ0ZXIgS2l0XG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQgS29uc3RhbnRpbiBUYXJrdXMgKEBrb2lzdHlhKSwgS3JpYVNvZnQgTExDLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRS50eHQgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmV4cG9ydCBkZWZhdWx0IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBwcm9wVHlwZXM6IHtcbiAgICBib2R5OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWRcbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgdmFyIHsgY2xhc3NOYW1lLCB0aXRsZSwgYm9keSwgb3RoZXIgfSA9IHRoaXMucHJvcHM7XG5cbiAgICAvKiBqc2hpbnQgaWdub3JlOnN0YXJ0ICovXG4gICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPXsnQ29udGVudFBhZ2UgJyArIGNsYXNzTmFtZX1cbiAgICAgIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7X19odG1sOiBib2R5fX0gLz47XG4gICAgLyoganNoaW50IGlnbm9yZTplbmQgKi9cbiAgfVxuXG59KTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vfi9qc2hpbnQtbG9hZGVyIS4vc3JjL2NvbXBvbmVudHMvQ29udGVudFBhZ2UvQ29udGVudFBhZ2UuanNcbiAqKi8iLCIvKlxuICogUmVhY3QuanMgU3RhcnRlciBLaXRcbiAqIENvcHlyaWdodCAoYykgMjAxNCBLb25zdGFudGluIFRhcmt1cyAoQGtvaXN0eWEpLCBLcmlhU29mdCBMTEMuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFLnR4dCBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuZXhwb3J0IGRlZmF1bHQgUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgLyoganNoaW50IGlnbm9yZTpzdGFydCAqL1xuICAgICAgPGRpdiBjbGFzc05hbWU9XCJuYXZiYXItdG9wXCIgcm9sZT1cIm5hdmlnYXRpb25cIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb250YWluZXJcIj5cbiAgICAgICAgICA8YSBjbGFzc05hbWU9XCJuYXZiYXItYnJhbmQgcm93XCIgaHJlZj1cIi9cIj5cbiAgICAgICAgICAgIDxpbWcgc3JjPXtyZXF1aXJlKCcuL2xvZ28tc21hbGwucG5nJyl9IHdpZHRoPVwiMzhcIiBoZWlnaHQ9XCIzOFwiIGFsdD1cIlJlYWN0XCIgLz5cbiAgICAgICAgICAgIDxzcGFuPlJlYWN0LmpzIFN0YXJ0ZXIgS2l0PC9zcGFuPlxuICAgICAgICAgIDwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICAgIC8qIGpzaGludCBpZ25vcmU6ZW5kICovXG4gICAgKTtcbiAgfVxuXG59KTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vfi9qc2hpbnQtbG9hZGVyIS4vc3JjL2NvbXBvbmVudHMvTmF2YmFyL05hdmJhci5qc1xuICoqLyIsIi8qXG4gKiBSZWFjdC5qcyBTdGFydGVyIEtpdFxuICogQ29weXJpZ2h0IChjKSAyMDE0IEtvbnN0YW50aW4gVGFya3VzIChAa29pc3R5YSksIEtyaWFTb2Z0IExMQy5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UudHh0IGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vL3JlcXVpcmUoJy4vTm90Rm91bmRQYWdlLmxlc3MnKTtcblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuZXhwb3J0IGRlZmF1bHQgUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgLyoganNoaW50IGlnbm9yZTpzdGFydCAqL1xuICAgICAgPGRpdj5cbiAgICAgICAgPGgxPlBhZ2UgTm90IEZvdW5kPC9oMT5cbiAgICAgICAgPHA+U29ycnksIGJ1dCB0aGUgcGFnZSB5b3Ugd2VyZSB0cnlpbmcgdG8gdmlldyBkb2VzIG5vdCBleGlzdC48L3A+XG4gICAgICA8L2Rpdj5cbiAgICAgIC8qIGpzaGludCBpZ25vcmU6ZW5kICovXG4gICAgKTtcbiAgfVxuXG59KTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vfi9qc2hpbnQtbG9hZGVyIS4vc3JjL2NvbXBvbmVudHMvTm90Rm91bmRQYWdlL05vdEZvdW5kUGFnZS5qc1xuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XHJcblx0dmFyIGxpc3QgPSBbXTtcclxuXHRsaXN0LnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XHJcblx0XHR2YXIgcmVzdWx0ID0gW107XHJcblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHR2YXIgaXRlbSA9IHRoaXNbaV07XHJcblx0XHRcdGlmKGl0ZW1bMl0pIHtcclxuXHRcdFx0XHRyZXN1bHQucHVzaChcIkBtZWRpYSBcIiArIGl0ZW1bMl0gKyBcIntcIiArIGl0ZW1bMV0gKyBcIn1cIik7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0cmVzdWx0LnB1c2goaXRlbVsxXSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiByZXN1bHQuam9pbihcIlwiKTtcclxuXHR9O1xyXG5cdHJldHVybiBsaXN0O1xyXG59XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vY3NzLWxvYWRlci9jc3NUb1N0cmluZy5qc1xuICoqIG1vZHVsZSBpZCA9IDE2XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiL1VzZXJzL2tldmluYmxlaWNoL0RvY3VtZW50cy9yZWFjdC1zdGFydGVyLWtpdC9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9jc3NUb1N0cmluZy5qc1wiKSgpO1xuZXhwb3J0cy5wdXNoKFttb2R1bGUuaWQsIFwiLypcXG4gKiBSZWFjdC5qcyBTdGFydGVyIEtpdFxcbiAqIENvcHlyaWdodCAoYykgMjAxNCBLb25zdGFudGluIFRhcmt1cyAoQGtvaXN0eWEpLCBLcmlhU29mdCBMTEMuXFxuICpcXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSBmb3VuZCBpbiB0aGVcXG4gKiBMSUNFTlNFLnR4dCBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxcbiAqL1xcblwiLCBcIlwiXSk7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL3NyYy9jb21wb25lbnRzL0FwcC9BcHAubGVzc1xuICoqIG1vZHVsZSBpZCA9IDE3XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IFwiZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFDWUFBQUFtQ0FZQUFBQ29QZW11QUFBQUdYUkZXSFJUYjJaMGQyRnlaUUJCWkc5aVpTQkpiV0ZuWlZKbFlXUjVjY2xsUEFBQUNyUkpSRUZVZU5xY1dBbFFsRmNTbm9zQmhtRm1CQWFWRzBSQUVCUVZVVWgyalJLamlLSkdFZkZFOFlpc0drdzA2NnJybWQybzViV2FhSXlhUXVNUm8vRUFpUkc4U29qeHdBTUZFUVdFa1VNWWtCbG1tSHRtdS8vOWYrcnRYemhGUWxYWFBON3IxOTJ2WC9mWC9YNCt4LzRmRjRnSHhBY1NBRG5RdndKNmprc1RoeGh6NlRVK3pVL3U0Ukg4ZHYvNDNUQ0tNVWhJa3lQOXkyY1p4K1ozWlBHVGgvblRocEZLR09GT0JBbHA1WHlhaisxVmh0K1o0Ty9LTU51N0RCUFlNWm94REpVNGk3Mzl4ZS85NitCSUIxZXBYRnRmKzdwNHg5cDdxdW9LTGF5WmdVeEFGdUt3MVBWSkEwTmNCbisySmNiRnk4L0gxSzVxTHZ6SHdtdWF1aG9OYlJ3YVphV3BTOCs4eTVOQytyU2lQaFBTZk9NMmYzTlk0T3dTempCWUxlYTNiUldsaDM2ZGwzaGMzOUprSkJUd25OdzloUjhkeVpzaEM0bkk0UEVGUFpnOVpwMjI3UGI2cFJrdnp4K3JoWDg3Z1BSQVJ1SlFkcStTdVVaSG1rU2pEK2R1QWs5RmxoL2ZuMW13ZU5KMkxwZGJpQjZVQnZTZEV6Wjk0UWhRK0t6NThWMzBtblA0N0wvMUhiWC83RDV4YjkveEhVME4xeXQrUFBUVjFjd3AyL2xDeDBKNTlMQ3BudEd4M3FWSGRsK2xqYkhTSHJkMXgyTmMybHNZSHlKWm56QzNpWmNlMzNuNy9FbjJoZVFoaDBuWHg2N2ROVGhrNnJ5TlBBY0hTVm4yM2kwNEZ6NW42VnFyeWFTdStPbkkranRic29ySjBKaVk4MkMrckcvRW5QUGpCc1MyVlphMzBsN1QwVjZ6c2VQSUxreUVwTXdQNFBKNG9wYlNody9wMHhscE1vSGlraXZ6eHkwenRMVXFJdVl1MzRpRVk1ekROVHIyR0g0emVQVWh5Z3BKeVFna0VvZjdyZ0IvbDJHVWNjNGVQYWtZMGI2cGE2ZFB4UVF0cmd2ZTNDL1V2emp6L1VVdW4rK0k5UHpIUXhkd2prNGNMczFMN2V0b2JrUVpIR2NQVHhsaEZQZVBaR1VuU0pwMUhkU0VrOHhkeXVLbnNpOHdNY1UvSXYzVEpSM05EZFU0R1pueFdXYmJpekpGZGQ1cERXRWNwY3RSNWliNTN5SHI5U3djdE9zeE5zcFQrTlY0djdBTkZ4MWxQWHJEand0SnJqNEJrcmhOWDYrMm1rM0cvUGxKKzVCd2pITzR4dUlYT2NuY1VBWkhXWEpQUXdDMm9LdHI1WFdCMmd3NFVyL1ZPYWZVb0t4ZDdCT0lVT0VLSklQcmxRZU5ueDc2NGVGTFdVS0p6S2ZsNllQZis4OWZFWVdFWTV6RE5lUkJYdHdESkJGN0IvUkRXYlg1RnpybzVISmtWWVpPZTlpMWpUbUZDMjJFQkxCTE9xV2dmSmZBV1NUVktac1V6cDY5QWgxRVlvL3VsaGFNTFZPSFJxbHJhcXlHMlBLRjBGQ2RTUWpMQW9oUndab2FDT05PU3lRSndvaUZTeFJZSVZGeVJLR3BDL3FHejE0NjI5VXZLQUV3Q0UvTTZYaFQ5N0pkVVYxbFVMMVYrWTFNbXF5cHIzMXk2NHQ1QncxdExVWk52UUtGYzhSZXZpNk9NbmZoKzF1UExCUjcrVVhXWHN2OTJWSGFRK3JxR3hnazZ1a2RqRHdXbzZHdHZiYXFvT3pvM3FQUFQzMzNnZ0JiQm5ETmZGWnRFL21PVFBJY2V5eC9VOUM0YWV1RVVwbC9lMDFsVVgxUlFVR1AwTWlZRjJlelQ5LzROQzAvSW4zNU1HZDVUKzliSzlPM3dWcXp2cVhaYURVYXJFZ3dOa0haMGFtckt5b0NrMUlTVEpyMmxrdXBmemtGUnVybEEyT0hWT1djM0E4SGJaY0VCSS8wR3psK1ptaHFoci82MWNzSHdHOGlzNTVQRkZyUjhQVjdCdy8rL010c0J4ZlhVT1dUNG9OWFA1bTg1ZUdlRFlVMVY4N1ZBS0svSjVMM2xvQzNHc0puWmFiWDNicHk5dUhlVFEvd1NvT1NVdjFqMSt4SURKNDBLOHBxTm12ZVZqeFZxMnRlZHNpallteTlZMGNrcWFxZTN3dEptVGNTTU15Y095VitEMVNRbTRwcnVXZmN3NlBid01CSkFXTStuZ1N5SDcyKytVc3pBVWRVWUhvSGpKMHlkTTR6blhMbW83ZlBnaWZPR2d0ejBVQ0RFT0NCUm8wK2ZDbDdicm5CbEhLenFoUjRXcHpjNUhOaFBqVjYyZnB0YzUvcFRla1ZKaHNTanFPWGI5aU9hM0NsYzRDM0dmZmdYcFNCc21pWktEc2FkYUZPMUkwMm9DMW9VeWM4RE14Y204TGw4bHh2L3pOekpSVFpSaHExOVhUSjBCWHZXSlBEc2Rrc0xyMTl3eFZYYzg3b1c1c3hMbXhoTXhhbkFyQjI0aHVPdzlJV1RjTTFpRDBkOFA2TWUyQ3Z0WGpYdWx4R0hpM2JoTHBRSitwR0d4ajQ2RXhQb2F2RTEyTFExMVZlUE5GTTlFcFdKa3RheWg2cGRhMU5MOUM0aDNzMy84YlVOaUcwUWV3MEpPWnNGQy9zd2IwQUpTcEdIbEVST0tnVGRZTU5Qa3kyOHhnRGRNbzNwUUFKL3RBL2hiRFFuOHBhdjRSa0w1RkhyMzZBTVB5aHE3ZVBaakJIMTl4WXpUWk0xOVRBelBFb1h0Z0RlOE5RUmhldE9RZDFvbTZ3b1l5Skx4N1Q2RUhhbndWc3FRU1EzRGw4dzc2QmRMWlNIUWIrUmk3NFBCbkEwUUNCL1p0WGZFS3lyRzg0bGloTzhjNTFQOUNZeFBSY3F1TGQ2NCtoVXVRQjNnbTRCL28zUTlTaVZjbWtUTlNCdWxBbjZrWWI2QkJDbXlnbWR5Qy9rS25wOFRPS2xYY2dpQzBwTnlweitzMWNrb2JCQ25HVGpFRTg0ZHpkbTVEeVdSQ29ocVNmaW43RkFFZUM4ak1mV3FEZFNEaG01cEVIZVhFUDdnVVpTcFNGTWxFMjZrQmRvUE11NmtZYmFGdEVYS0lrVUpBQnFDNUtQSGtqSFU2N2dDZHdrRUozV2dxZytncUVKd0YwN0h6MDlaZGxDUWZPamZYOVlOekUyeHVYcmlzLzhXMGwwOVNTOVJjYXlDRHd4aFlBMkhNQU81Y0hacTRKaDJ4ZDBmem9UaTZBYlFCMHVSRndBeW9vK04vbFRSL3hQVlNIRHJLcjVSTDNUVDQ2Uk5LZ1VJK1l2MitiNEI0UlBRYmlvei9HQ1FqU1F4elVBSWkrY1E4ZkdHOVF0ZGFWbnp4NHdtWTJXeUZMTlZRWDRpWVhjd1VDSGhpVzVpaDE4NEdrS1hSeWwvZUVtdWtQQjNYQ1JPaFFOajZGL3U3eXZhOVdYUUNNYXlFTU1qQmxxYXQzb0pDK1hnbE5ycWxGaXQwQWprTG9PcDlBUyswUFdlY3BjQkY3UUQvdlpLOUlRbHpwelZxTjB0aXVhb0pxVUFQZGNLVE5haldjaXZmTkl1cWttamJNU0R4cUxBSTZLeTJzVnd1UEtlalFLVGlCRi9xOEtTNDYvY3ZNVVNmSUt4dHpORCt0OTdBUnN4UTM4azdYRmx3c3gwbS9oQWxodmlNU1V4cCt2M0hzOHV3UC80OS83UEZyMDNzT2lwc0dNazFHZFp1ZXFJOTYyaWhHdjQzSHdpeW1kVFl3RytDRkpNUE9GQXA0QlgwNkZVM3Fna1VUajJzYlg1ZDR4eWVNaDY3Qlp0SnFiRGpHdWZ5TXBCL1kvUERzZTQ2eW9CNkxDQjNNOVpsSmJPT3hIcDgyQWdBcEl6MGlCMU5kSjdROERUUmlNMEdxZ3hUWFFXQnZBM0JVeDIzY2x4bS8rWnRNSEZOelJvT096YTl2VmFJTWpuekFVQW43NmdqOWRuditUZ081UEQ3MTVvT3MwUktJYmFHRm1pQ0lXMHNPYmovZ0lKWjRJT0VZNTFnUFlXb1B5TkJSbFVFczRiUFJ2N3M5UDdQQnFtMVFvQktPeEMvSWcwNFE4akZpZ1JiSWE4QW5xNWRZOURxS0Q4ZlEvcngrZW1SWEM2czc1dEV5T0xSTUs5bEpkUGVWMUZrblM3N2RWZzNaMVNZZkVCdEh3Z3FrdmhDQ2VWTE1xcTMvc1ZuTTJxSzFpMWNVcmxtVUJXUE5rSlgvM29OcnlFTzJ6aDVSUTRlakxKQlp4YnJDYm5tTVRBU3pTZHR1ME5ZcnpnTW96Z0JsTlZDSUs5ejZEUWoyaUJyeU1ZQnhDQVI2M2xWNG5RTmVVYzhwVmVXejlGRUh6cTNzRmZQK0YybjNteVlyUys2ZmFYMzIrS1Y3LzBFaDRMR3A3YTlmSFFlWlRMQy84enJ0ZmJ0d1lMN1l5SUw3dVkzSnZyTFZXZDRya2ZrZ1lsUzl2VnQvKzlxaDY4dFNpNGlNNnZ3WTg4R2VrM0ZlY2FNeWhOSWVzY3dlS1BoNStZdVNWOFBobEdUcjA5VzNDNjZkZHlYNVNZbnFjcUVJKzhtQ3d6MFYxL05xNGQzWVFnUzRtZlcxaCtrZzhOM3A3dlBYai93QTRadmdDbXVKSHM5QTdMWDlFY1BZYjB6eWljVWhJTVhVbGNlSUw0bDhJcUhJVHd4MnI1TGZuZWNYSys3STd4RkdBby9NUkVCYldJYVRmT1JCM2drWDNUSE1TaGhGS2pOMWNXb2JxN1NaQ1RMWkE5US9ZeGpiYXhiV3I4MU9abHU3NExWMlIrRi9CUmdBMkU5eGdYcDN4emdBQUFBQVNVVk9SSzVDWUlJPVwiXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL3NyYy9jb21wb25lbnRzL05hdmJhci9sb2dvLXNtYWxsLnBuZ1xuICoqIG1vZHVsZSBpZCA9IDE4XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJldmVudGVtaXR0ZXIzXCIpO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogZXh0ZXJuYWwgXCJldmVudGVtaXR0ZXIzXCJcbiAqKiBtb2R1bGUgaWQgPSAxOVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZXhwcmVzc1wiKTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIGV4dGVybmFsIFwiZXhwcmVzc1wiXG4gKiogbW9kdWxlIGlkID0gMjBcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImZsdXhcIik7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiBleHRlcm5hbCBcImZsdXhcIlxuICoqIG1vZHVsZSBpZCA9IDIxXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJmcm9udC1tYXR0ZXJcIik7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiBleHRlcm5hbCBcImZyb250LW1hdHRlclwiXG4gKiogbW9kdWxlIGlkID0gMjJcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImZzXCIpO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogZXh0ZXJuYWwgXCJmc1wiXG4gKiogbW9kdWxlIGlkID0gMjNcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImphZGVcIik7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiBleHRlcm5hbCBcImphZGVcIlxuICoqIG1vZHVsZSBpZCA9IDI0XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJsb2Rhc2hcIik7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiBleHRlcm5hbCBcImxvZGFzaFwiXG4gKiogbW9kdWxlIGlkID0gMjVcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInBhdGhcIik7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiBleHRlcm5hbCBcInBhdGhcIlxuICoqIG1vZHVsZSBpZCA9IDI2XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJzdXBlcmFnZW50XCIpO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogZXh0ZXJuYWwgXCJzdXBlcmFnZW50XCJcbiAqKiBtb2R1bGUgaWQgPSAyN1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIl0sInNvdXJjZVJvb3QiOiIiLCJmaWxlIjoic2VydmVyLmpzIn0=