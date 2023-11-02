var botId = "st-38448176-33b1-51d6-8b16-0107967e297e";
var botName = "DixiPOC";
var sdk = require("./lib/sdk");
var request = require('request-promise');
var ActiveDirectory = require('activedirectory');
var config = { url: 'ldaps://regn-ldap.regeneron.com',
               baseDN: 'DC=regeneron,DC=regn,DC=com',
               username: "CN=svc.koreadmin,OU=System,OU=Regeneron Accounts,DC=regeneron,DC=regn,DC=com",
               password: 'rL(u,7tTnGOM.M~j' }

function getUserDetails(ms_userId) {
    return new Promise(function (resolve, reject) {
        var tenentId = "3e9aadf8-6a16-490f-8dcd-c68860caae0b";
        var ms_client_id = "3e44298c-9373-47ce-b73c-8f461f27b42a";
        var ms_client_secret = "M-38Q~PX3IGBSDlT4o46ev9v4pBx5tUIBI53Rdsk";
        var ms_grant_type = "client_credentials";
        var ms_scope = "https://graph.microsoft.com/.default";
        var formData = {
            "client_id": ms_client_id,
            "scope": ms_scope,
            "client_secret": ms_client_secret,
            "grant_type": ms_grant_type
        }
        var options = {
            "method": "POST",
            "url": 'https://login.microsoftonline.com/'+tenentId+'/oauth2/v2.0/token',
            "form": formData,
            "headers": {
            "Content-Type": "application/x-www-form-urlencoded"
            },
            "json": true
        };
        return request(options, async (err, res, body) => {
            if (err) {
            return reject("Error");
            } 
            else {
            var accessToken = "Bearer " + body.access_token;

// For getting the AD groups which the user is part of
//var url = "https://graph.microsoft.com/v1.0/users/" +ms_userId+"/getMemberGroups"

// For getting user information
            var url = "https://graph.microsoft.com/v1.0/users/"+ms_userId

            var options1 = {
                "method": "GET",
                "url": url,
                "headers": {
                "Authorization": accessToken
                },
                // "body":{
                // "securityEnabledOnly":false
                // },
                "json": true
            };
// console.log("\noptions1\n", JSON.stringify(options1))
// return new Promise((resolve, reject) => {
            return request(options1, async (err, res, body) => {
                if (err) {
                console.log("error", err);
                return reject("Error");
                } 
                else {
                console.log(JSON.stringify(body));
                return resolve(body);
                }
            });
        }
    })
})
}               

module.exports = {
    botId   : botId,
    botName : botName,

    on_user_message : function(requestId, data, callback) {
        var ms_userId = data.context.session.BotUserSession.lastMessage.messagePayload.from.aadObjectId;
        return getUserDetails(ms_userId)
        .then((body) =>{
            console.log(body);
            console.log(body.mail);
            //var body = JSON.stringify(body);
            var username = JSON.stringify(body.mail);
            console.log(username);
            //var username = 'pritesh.raka@regeneron.com';
        var groupName = 'Group-Dixibot-App-Chatbot-Prd';

        var ad = new ActiveDirectory(config);
        ad.isUserMemberOf(username, groupName, function(err, isMember) {
            if (err) {
            console.log('ERROR: ' +JSON.stringify(err));
            return;
            }
            if (isMember === true) {
            return sdk.sendBotMessage(data, callback);
        }
        else {
            data.message = "User doesn't have access to this bot";
            return sdk.sendUserMessage(data,callback);
        }
            console.log(username + ' isMemberOf ' + groupName + ': ' + isMember);
            });
        })
        .catch(error => {
            console.log(error);
        })
        
    },
    on_bot_message  : function(requestId, data, callback) {
        if (data.message === 'hello') {
            data.message = 'The Bot says hello!';
        }
        //Sends back the message to user

        return sdk.sendUserMessage(data, callback);
    },
    on_agent_transfer : function(requestId, data, callback){
        return callback(null, data);
    },
    on_event : function (requestId, data, callback) {
        console.log("on_event -->  Event : ", data.event);
        return callback(null, data);
    },
    on_alert : function (requestId, data, callback) {
        console.log("on_alert -->  : ", data, data.message);
        return sdk.sendAlertMessage(data, callback);
    }

};