(function (undefined) {
  angular.module('restful', ['ng']).
  factory('$restful', ['$http', function($http) {
      
      var noop = angular.noop,
      forEach = angular.forEach,
      extend = angular.extend,
      copy = angular.copy,
      isFunction = angular.isFunction,
      getter = function(obj, path) {
        return $parse(path)(obj);
      };
  		
			Object.defineProperty(Array.prototype, 'has', {
        value: function(value) {
          var retorno = false;
          if( this.length ){
            for( var i = 0; i < this.length; i++ ){
              if( this[i] == value ){
                retorno = true;
                break;
              }
            }
          }
          return retorno;
        }
      });
    
      function encodeUriSegment(val) {
      	return encodeUriQuery(val, true).
          replace(/%26/gi, '&').
          replace(/%3D/gi, '=').
          replace(/%2B/gi, '+');
      }
  
      function encodeUriQuery(val, pctEncodeSpaces) {
        return encodeURIComponent(val).
          replace(/%40/gi, '@').
          replace(/%3A/gi, ':').
          replace(/%24/g, '$').
          replace(/%2C/gi, ',').
          replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
      }
  
      function Route(template, defaults) {
        this.template = template = template + '#';
        this.defaults = defaults || {};
        this.urlParams = {};
      }
  
      Route.prototype = {
        setUrlParams: function(config, params, actionUrl) {
          var self = this,
            url = actionUrl || self.template,
            val,
            encodedVal;
    
          var urlParams = self.urlParams = {};
          forEach(url.split(/\W/), function(param){
            if (param && (new RegExp("(^|[^\\\\]):" + param + "(\\W|$)").test(url))) {
              urlParams[param] = true;
            }
          });
          url = url.replace(/\\:/g, ':');
    
          params = params || {};
          forEach(self.urlParams, function(_, urlParam){
            val = params.hasOwnProperty(urlParam) ? params[urlParam] : self.defaults[urlParam];
            if (angular.isDefined(val) && val !== null) {
              encodedVal = encodeUriSegment(val);
              url = url.replace(new RegExp(":" + urlParam + "(\\W|$)", "g"), encodedVal + "$1");
            } else {
              url = url.replace(new RegExp("(\/?):" + urlParam + "(\\W|$)", "g"), function(match, leadingSlashes, tail) {
                if (tail.charAt(0) == '/') {
                  return tail;
                } else {
                  return leadingSlashes + tail;
                }
              });
            }
          });
    
          // set the url
          config.url = url.replace(/\/?#$/, '').replace(/\/*$/, '');
    
          // set params - delegate param encoding to $http
          forEach(params, function(value, key){
            if (!self.urlParams[key]) {
              config.params = config.params || {};
              config.params[key] = value;
            }
          });
        }
      };
  
  
      function RestfulFactory(url, opts) {
      
        var defaultActions = {
          'get':      {method:'GET'},
          'query':    {method:'GET', isArray:true},
          'create':   {method:'POST'},
          'update':   {method:'PUT'},
          'destroy':  {method:'DELETE'}
        };
    
        var optDefault = {
          params:     {},
          actions:    {},
          only:       [],
          except:     []
        };
    
        opts = angular.extend({}, optDefault, opts);
        actions = angular.extend({}, defaultActions, opts.actions);
        
        if( opts.only.length ){
          var newActions = [];
        	forEach(actions, function(value, key){
            if( !opts.only.has(key) )
              	newActions.push(value);
          });
          actions = newActions;
        } else if( opts.except.length ) {
          var newActions = [];
        	forEach(actions, function(value, key){
            if( opts.except.has(key) )
              	newActions.push(value);
          });
          actions = newActions;
        }
        
        var route = new Route(url);
    
        function extractParams(data, actionParams){
          var ids = {};
          actionParams = extend({}, opts.params, actionParams);
          forEach(actionParams, function(value, key){
            if (isFunction(value)) { value = value(); }
            ids[key] = value.charAt && value.charAt(0) == '@' ? getter(data, value.substr(1)) : value;
          });
          return ids;
        }
    
        function Restful(value){
          copy(value || {}, this);
        }
    
        forEach(actions, function(action, name) {
          action.method = angular.uppercase(action.method);
          var hasBody = action.method == 'POST' || action.method == 'PUT' || action.method == 'PATCH';
          Restful[name] = function(a1, a2, a3, a4, a5) {
            var params = {},
            		data,
                resources,
                success = noop,
                error = null,
                promise;
    
            switch(arguments.length) {
              case 5:
                error = a5;
              case 4:
                success = a4;
              case 3:
                if (isFunction(a3)){
                  if(isFunction(a2)){
                  	success = a2;
                    error = a3;
                  } else {
										success = a3;
                  }
                } else {
                  resources = a3;
                }
              case 2:
                if(isFunction(a2))
                  success = a2;
                else if(isArray(a2))
                  resources = a2;
                else
                	data = a1  
              case 1:
                if (isFunction(a1)) success = a1;
                else if (isArray(a1)) resources = a1;
                else if (hasBody) data = a1;
                else params = a1;
              	break;
              case 0: break;
              default:
              	throw "Expected between 0-5 arguments [params, data, resources, success, error], got " + arguments.length + " arguments.";
            }
    
            var value = this instanceof Restful ? this : (action.isArray ? [] : new Restful(data));
            var httpConfig = {},
            promise;
    
            forEach(action, function(value, key) {
              if (key != 'params' && key != 'isArray' ) {
                httpConfig[key] = copy(value);
              }
            });
            httpConfig.data = data;
            route.setUrlParams(httpConfig, extend({}, extractParams(data, action.params || {}), params), action.url);
    
            function markResolved() { value.$resolved = true; }
            
            promise = $http(httpConfig);
            value.$resolved = false;
    
            promise.then(markResolved, markResolved);
            value.$then = promise.then(function(response) {
              var data = response.data;
              var then = value.$then, resolved = value.$resolved;
    
              if (data) {
                if (action.isArray) {
                  value.length = 0;
                  forEach(data, function(item) {
                    value.push(new Restful(item));
                  });
                } else {
                  copy(data, value);
                  value.$then = then;
                  value.$resolved = resolved;
                }
              }
    
              (success||noop)(value, response.headers);
    
              response.Restful = value;
              return response;
            }, error).then;
    
            return value;
          };
    
    
          Restful.prototype['$' + name] = function(a1, a2, a3, a4) {
            var params = extractParams(this),
              resources,
              success = noop,
              error;
    
            switch(arguments.length) {
              case 4:
                error = a4;
              case 3:
                success = a4;
              case 2:
                if (isFunction(a2)) {
                  if (isFunction(a1)) {
                    success = a1;
                    error = a2;
                  } else {
                    success = a2;
                  }
                } else {
                  resources = a2;
                } 
              case 1:
              	if (isFunction(a1)) success = a1;
                else if (isArray(a1)) resources = a1;
                else params = a1;
              	break;
              case 0: break;
              default:
              	throw "Expected between 0-4 arguments [params, resources, success, error], got " + arguments.length + " arguments.";
            }
            var data = hasBody ? this : undefined;
            Restful[name].call(this, params, data, resources, success, error);
          };
        });
    
        Restful.bind = function(additionalParamDefaults){
          return RestfulFactory(url, extend({}, opts, additionalParamDefaults));
        };
    
        return Restful;
      };
  
      return RestfulFactory;
  }]);
}());