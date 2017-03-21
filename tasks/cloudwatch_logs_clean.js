'use strict';

const AWS = require("aws-sdk");

module.exports = function (grunt) {

  function cloudwatch_logs_clean(options) {
    console.log("Cleaning logs from cloudwatch");
    let lambda = new AWS.Lambda({ region: options.region });
    let apigateway = new AWS.APIGateway({ region: options.region });
    let cloudwatchlogs = new AWS.CloudWatchLogs({ region: options.region });

    return cloudwatchlogs.describeLogGroups({}).promise().then(data => {
      return Promise.all([
        lambda.listFunctions({}).promise().then(data => {
          return data.Functions.reduce((map, f) => {
            map[f.FunctionName] = f;
            return map;
          }, {});
        }),
        apigateway.getRestApis({}).promise().then(data => {
          return Promise.all(data.items.map(restApi => apigateway.getStages({ restApiId: restApi.id }).promise()
            .then(stages => stages.item.map(s => Object.assign({}, s, { restApiId: restApi.id })))))
            .then(arrayOfStages => arrayOfStages.reduce((acc, next) => acc.concat(next), []))
            .then(stages => stages.reduce((map, s) => {
              if (!map[s.restApiId]) {
                map[s.restApiId] = {};
              }
              map[s.restApiId][s.stageName] = s;
              return map;
            }, {}));
        })
      ])
        .then(results =>
          data.logGroups.filter(logGroup => {
            let matchLambda = logGroup.logGroupName.match(/\/aws\/lambda\/(.*)/);
            if (matchLambda && matchLambda.length > 1) {
              if (!results[0][matchLambda[1]]) {
                console.log(`Selecting ${logGroup.logGroupName} for deletion`);
                return true;
              }
            }
            let matchApi = logGroup.logGroupName.match(/API-Gateway-Execution-Logs_(.*)\/(.*)/);
            if (matchApi && matchApi.length > 2) {
              if (!results[1][matchApi[1]] || !results[1][matchApi[1]][matchApi[2]]) {
                console.log(`Selecting ${logGroup.logGroupName} for deletion`);
                return true;
              }
            }
            return false;
          })
        )
        .then(res => Promise.all(res.map(logGroup => cloudwatchlogs.deleteLogGroup({ logGroupName: logGroup.logGroupName }).promise())));
    });
  }


  grunt.registerMultiTask('cloudwatch_logs_clean', 'Clean log groups and log stream for resurces that no longer exist', function () {
    var options = this.options({
      region: "eu-west-1"
    });
    let done = this.async();
    cloudwatch_logs_clean(options).then(() => done());
  });

};
