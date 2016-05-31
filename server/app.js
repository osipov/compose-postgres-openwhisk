var util = require('util')
var bodyParser = require('body-parser')
var express = require('express')
var app = express()
var PORT = 8080

/**
* Polyfill a promise finally function per the promises spec https://www.promisejs.org/api/
* @ param f an function to evaluate using Promise.resolve regardless of the state of the promise
* @ return a promise that evaluates the return value of the input function f
*/
if (!Promise.prototype.finally) {
  Promise.prototype.finally = function (f) {
    return this.then(function (value) {
      return Promise.resolve(f(value)).then(function () {
        return value;
      });
    }, function (err) {
      return Promise.resolve(f(err)).then(function () {
        throw err;
      });
    });
  }
}
/**
* Polyfill a string supplant function per Crockford's Javascript
* @param match a string specifying keys to supplant with values per Crockford's format, e.g. "x={x}" where {x} is the substring to specify the key named x
* @ param val a Javascript object specifying the values for the keys to be replaced in the match string, e.g. {"x":"1"}
* @return modified match string such that the keys are replaced with values, e.g. "x=1"
*/
if (!String.prototype.supplant) {
    String.prototype.supplant = function (s) {
        return this.replace(
            /\{([^{}]*)\}/g,
            function (match, val) {
                var replacement = s[val];
                return typeof replacement === 'string' || typeof replacement === 'number' ? replacement : match
            }
        );
    };
}

/**
 * Improved version of the endpoint wrapper from the OpenWhisk documentation
 * use a try-catch block to catch errors and send an http response in case of an exception
 *
 * @param se a service endpoint that implements a standard express protocol se(req, res, next)
 * @return wrapped service endpoint with a default error message in case of a service exception
 */
function wrapWithExceptionHandler(se, eh) {
  return function safeEndpoint(req, res, next) {
    try {
      se(req, res, next);
    } catch (err) {
      console.log('[wrapWithExceptionHandler] error %s', err);
      eh(err, req, res, next);
    }
  }
}

function exceptionHandler(err, req, res, next) {
  res.json({"msg" : "internal error", "error": err});
}

/**
 * instantiate a service  which handles REST calls from the Invoker
 */
var service = require('./service').getService(console);

app.set('port', PORT);
app.use(bodyParser.json());
app.post('/init', wrapWithExceptionHandler(service.init, exceptionHandler));
app.post('/run',  wrapWithExceptionHandler(service.run, exceptionHandler));
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('bad request');
});
console.log('launching an OpenWhisk Docker-based action implementation...');
service.start(app);
