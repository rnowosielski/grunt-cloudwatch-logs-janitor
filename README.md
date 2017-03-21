# grunt-cloudwatch-logs-janitor
Grunt task that cleans up cloudwatch log groups and log streams for resources that are no longer around

For now it checks default logs from AWS Lambda and ApiGateway

## Installation

In order to install the package call

    npm install grunt-cloudwatch-logs-janitor --save-dev
    
and add it to your `Gruntfile.js` the taks configuration

    grunt.initConfig({
        cloudwatch_logs_clean: {
            default: {
                options: {
                    region: "eu-west-1"
                }
            }
        }       
    });

and possibly add to on of your tasks

    grunt.registerTask('deploy', [ ... 'cloudwatch_logs_clean']);

