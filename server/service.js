var fs = require('fs');
var pg = require('pg');
var request = require('request')
var Promise = require('promise/lib/es6-extensions');

function UpdateComposeService(logger) {

    var server = undefined;

    /**
     * Start the server.
     *
     * @param app express app
     */
    this.start = function start(app) {
        var self = this;
        server = app.listen(app.get('port'), function() {
            var host = server.address().address;
            var port = server.address().port;
            logger.log('[start] listening at http://%s:%s', host, port);
        });
    }

    /**
     * req.body = { main: String, code: String, name: String }
     */
    this.init = function init(req, res) {
      if (status === Status.ready) {
        try {
          var body = req.body || {};
          logger.log('[init] %s', body);
          res.status(200).send();
        } catch (err) {
          logger.log('[init] error %err', err);
          res.status(500).send();
        }
      }
    }

    /**
     * req.body = { value: Object, meta { activationId : int } }
     */
    this.run = function run(req, res) {
      var meta = (req.body || {}).meta;
      var value = (req.body || {}).value;
      var ctx = value;

      // logger.log('[run] this is my log entry v8')

      queryPitneyBowes(ctx)
      .then(connectToCompose)
      .then(insertIntoCompose)
      .then(queryCompose)
      .then(releaseComposeConnection)
      .then(function(ctx) {
        logger.log('[run] 200 status code result %s', JSON.stringify(ctx.result));
        res.status(200).json(ctx.result);
        return ctx;
      })
      .catch(function(ctx) {
        logger.log('[run] 500 status code ctx ', JSON.stringify(ctx.err))
        res.status(500).json({'err': ctx.err});
        throw ctx;
      })

    }

    function connectToCompose (ctx) {
      return new Promise(function(resolve, reject) {
        if (!ctx || !ctx.connString) reject('Missing Postgres connection string parameter')
        var connString = ctx.connString;

        // logger.log('[connectToCompose] attempting to connect obtain Postgres client using ' + connString)
        pg.connect(connString, function(err, client, done) {
          if (err) {

            logger.error('[connectToCompose] failed to fetch client from pool', err)
            reject(err);

          } else {

            ctx.client = client; ctx.done = done;
            logger.log('[connectToCompose] obtained a Compose client');
            resolve(ctx);

          }
        })
      })
    }

    function insertIntoCompose(ctx) {
      logger.log('[insertIntoCompose] entry')
      return new Promise(function(resolve, reject){
        if (!ctx.client) {

          ctx.err('Unable to find a client for the query');
          reject(ctx);

        } else if (!ctx.address || !ctx.city || !ctx.state || !ctx.postalCode || !ctx.country || !ctx.lat || !ctx.lon) {

          ctx.err = 'Missing required address parameters'
          reject(ctx);

        } else {

          ctx.client.query('INSERT INTO ADDRESS (address, city, state, postalCode, country, lat, lon) VALUES($1, $2, $3, $4, $5, $6, $7)',
            [ctx.address, ctx.city, ctx.state, ctx.postalCode, ctx.country, ctx.lat, ctx.lon], function(err, result) {

              if (err) {

                ctx.err = err
                reject(err)

              } else {

                logger.log('[insertIntoCompose] insert complete');
                resolve(ctx);

              }

          });
        }
      })
    }

    function queryCompose(ctx) {
      logger.log('[queryCompose] entry')
      return new Promise(function(resolve, reject) {
        if (!ctx.client) reject('Unable to find a client for the query');

        ctx.client.query('SELECT * FROM ADDRESS', function(err, result) {
          if (err) {

            logger.error('[queryCompose] error running query %s', err)
            ctx.err = err;
            reject(ctx);

          } else {

            logger.log('[queryCompose] complete');
            ctx.result = result;
            resolve(ctx);

          }
        })
      })
    }

    function queryPitneyBowes(ctx) {
      var pbGeocodeString = "https://pitneybowes.pbondemand.com/location/address/geocode.json?address={address}&city={city}&stateProvince={state}&postalCode={postalCode}&country={country}&appId={pbAppId}"

      logger.log('[queryPitneyBowes] entry');
      return new Promise(function(resolve, reject){

        if (!ctx || !ctx.pbAppId) {

          ctx.err = 'Missing Pitney Bowes App ID parameter';
          reject(ctx);

        } else
        if (!ctx.address || !ctx.city || !ctx.state || !ctx.postalCode || !ctx.country) {

          ctx.err = 'Missing required address parameters'
          reject(ctx);

        } else {

          var pbGeocodeArgs = ctx;
          var pbGeocodeUrl = pbGeocodeString.supplant(pbGeocodeArgs)

          logger.log('[queryPitneyBowes] ' + pbGeocodeUrl);

          var options = {
            "method": "GET",
            "url": pbGeocodeUrl,
            "rejectUnauthorized": false
          };

          request(options, function(err, resp, body) {

            if (err) {

              ctx.err = err;
              reject(ctx);

            } else {

              resp = JSON.parse(body);

              ctx.lat = resp.Output.Latitude;
              ctx.lon = resp.Output.Longitude;
              logger.log('[queryPitneyBowes] obtained lat and lon for the address')

              resolve(ctx);

            }
          })
        }
      })
    }

    function releaseComposeConnection(ctx) {
      logger.log('[releaseComposeConnection] entry');
      return new Promise(function(resolve, reject) {
        if (!ctx.done) {

            ctx.err = 'Unable to find a done method to release the Compose client'
            reject(ctx);

        } else {

          //release the pg client back to the pool
          logger.log('[releaseComposeConnection] releasing the client back to the pool')
          ctx.done();
          resolve(ctx);

        }
      })
    }
}

UpdateComposeService.getService = function(logger) {
    return new UpdateComposeService(logger);
}
module.exports = UpdateComposeService;
