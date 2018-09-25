'use strict';

const axios = require('axios');
const moment = require('moment');

module.exports.run = (event, context) => {
  const time = new Date();
  console.log(process.env.jiraSearchUrl);
  console.log(`Your cron function "${context.functionName}" ran at ${time}`);

    axios({
        method:'post',
        url:process.env.jiraSearchUrl,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        auth: {
            username: process.env.username,
            password: process.env.password
        },
        data: {
            "jql": "due >= '" + moment().subtract(14, 'days').format('YYYY-MM-DD') +"' AND due <= '" + moment().add(7, 'days').format('YYYY-MM-DD') + "' AND status!=resolved",
            "startAt": 0,
            "maxResults": 1000,
            "fields": [
                "summary",
                "status",
                "assignee",
                "duedate",
                "resolution"
            ]
        }
    })
        .then(function (response) {
            console.log(response.data);
        });
};
