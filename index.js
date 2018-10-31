//use the token to get list of all users
//Create a map between users email address and slack id

//Once download is complete Read each file

var text = "Hello World <http://www.foo.com|testlink>";
var attachments = [];

const sc = require('@slack/client').WebClient;
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load();
}

var token = process.env.TOKEN;
const slackclient = new sc(token, {
  maxRequestConcurrency: 20
});


var getAllUsers = function() {
  return new Promise((resolve, reject) => {

    var users = [];
    slackclient.users
      .list()
      .then(res => {
        for (var i = 0, len = res.members.length; i < len; i++) {
          if (res.members[i].is_bot === false &&
            res.members[i].id != 'USLACKBOT' &&
            res.members[i].is_restricted === false &&
            res.members[i].is_ultra_restricted === false &&
            res.members[i].deleted === false) {
            let userObj = {
              id: res.members[i].id,
              email: res.members[i].profile.email.toLowerCase()
            };
            users.push(userObj);
          }
        }
        resolve(users);
        //slackapp.trigger('users_downloaded', []);
      })
      .catch(error => {
        console.error("Received error %s", error);
        reject(error);
      });
  });
}

var sendDM = function(userObj) {
  return new Promise((resolve, reject) => {

    slackclient.im.open({
        user: userObj.id
      })
      .then((res) => { //res.channel.id//res:{channel: { id: 'DDHQUA6A2' },
        console.log(res);
        slackclient.chat.postMessage({
          channel: res.channel.id,

          text: text,
          attachments: attachments
        });
      })
      .then((res) => {
        //console.log(res);

      })
        .catch((error) => {
        console.log("Error during sending welcome message: %s", error);
        reject(error);
      });
  });
}



getAllUsers()
  .then(users => {

      users.forEach(function(user) {
        console.log("User email: ", user.email);
        console.log("User id: ", user.id);
          sendDM(user)
            .then(res => {
              console.log("Message sent. Received: ", res);
            })
            .catch(err => {
              console.log("Message failed. Error: ", err);
            })
        })

      })
.catch(error => {
  console.log(error);
})


/*
{"ok":true,"access_token":"xoxp-237445142373-238398295319-466200914451-cb72ae0c6d6e70d5a1fc28fdfc490867","scope":"identify,users:read,usergroups:read,usergroups:write","user_id":"W6PHCN6LB","team_name":"Falcons","team_id":"T6ZD346AZ"}
client_id=237445142373.467351391415&client_secret=4f381691c16a6aabbf945edffd3e5212&code=237445142373.466382684706.defbfb7d84c84266d09ed0a8ee049f5d97cfa0b7fc0649adde4cee8917c354a3
*/
