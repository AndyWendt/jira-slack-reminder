'use strict';

const axios = require('axios');
const moment = require('moment');
const { WebClient } = require('@slack/client');
const fs = require('fs');

module.exports.run = (event, context) => {
  const time = new Date();
  console.log(process.env.jiraSearchUrl);
  console.log(`Your cron function "${context.functionName}" ran at ${time}`);

  let userMappings = JSON.parse(fs.readFileSync('./userMappings.json', 'utf8'));

  const jql = "due >= '" + moment().subtract(14, 'days').format('YYYY-MM-DD') +"' AND due <= '" + moment().add(7, 'days').format('YYYY-MM-DD') + "' AND status!=resolved";

  console.log(jql);

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
          "jql": jql,
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
          response.data.issues.forEach(function (issue) {
              let jiraUser = issue.fields.assignee.name;
              let slackUser = userMappings[jiraUser];
              let ticketName = issue.key;
              let ticketDescription = issue.fields.summary;
              let dueDate = issue.fields.duedate;
              sendSlackReminder(slackUser, ticketName, ticketDescription, dueDate);
          });
      });
};

function sendSlackReminder(slackUserToRemind, ticketName, ticketId, dueDate) {
    let channel = process.env.slackRemindersChannel;
    let token = process.env.slackAccessToken;
    let message = `<@${slackUserToRemind}> This is a reminder that your ticket, ${ticketName} (${ticketId}), is due on ${dueDate}`;


    console.log(channel, token);

    const web = new WebClient(token);

    // See: https://api.slack.com/methods/chat.postMessage
    web.chat.postMessage({ channel: channel, text: message })
        .then((res) => {
            // `res` contains information about the posted message
            console.log('Message sent: ', res.ts);
        })
        .catch(console.error);
}
