var botId = "st-38448176-33b1-51d6-8b16-0107967e297e";
var botName = "DixiPOC";
var sdk = require("./lib/sdk");
var ActiveDirectory = require('activedirectory');
var config = { url: 'ldaps://regn-ldaps.regeneron.com',
               baseDN: 'DC=regeneron,DC=regn,DC=com',
               username: 'svc.koreadmin',
               password: 'rL(u,7tTnGOM.M~j' }


function CheckAdUser (username, groupName){
    return new Promise(function (resolve, reject){
        var ad = new ActiveDirectory(config);
        ad.isUserMemberOf(username, groupName, function(err, isMember){
            if (err !== undefined){
            reject (err);
            }
            else {
                resolve (isMember);
            }
        });
    });
}
module.exports = {
    botId   : botId,
    botName : botName,

    on_user_message : async function(requestId, data, callback) {
        //var username = data.context.session.BotUserSession.lastMessage.messagePayload.from.aadObjectId;
        var username = 'shyam.putta@regeneron.com';
        var groupName = 'Group-Dixibot-App-Chatbot-Prd';
        try {
                var isMember = await CheckAdUser(username,groupName)
                if (isMember === true) {
                    return sdk.sendBotMessage(data, callback);
                } 
                else {
                    data.message = "User doesn't have access to this bot";
                    return sdk.sendUserMessage(data,callback);
                }
        } 
        catch(e){

        }
        
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


