'use strict';

module.exports.run = (event, context) => {
  const time = new Date();
  console.log(process.env.jiraSearchUrl);
  console.log(`Your cron function "${context.functionName}" ran at ${time}`);
};
