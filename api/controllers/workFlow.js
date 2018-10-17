const mongoose = require("mongoose");

const User = require("../models/user");
const Device=require("../models/device");
const Message=require("../models/message");
// fcm server 
var admin = require('firebase-admin');
var serviceAccount = require('../AccountKey/smsgateway-5d944-firebase-adminsdk-zbyn3-0ffa63630d.json');

module.exports.SendToDevice= function(req, res){
  //console.log(req.body);

  var phoneNumer=req.body.phone;
  var messageText=req.body.messageText;
  var toPhoneNumber=req.body.toPhoneNumber;
 if(! admin.apps.length)

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://smsgateway-5d944.firebaseio.com"
  });
 // console.log(phone);
  getDevice(phoneNumer,function(data){
//this registration token is deviceID from the Device model

      var registrationToken =  data.deviceId;
      console.log('sending sms...');
// See documentation on defining a message payload.
      var message = {
        notification: {
          title: toPhoneNumber,
          body: messageText
      },
      token: registrationToken
      };

// Send a message to the device corresponding to the provided
// registration token.
    admin.messaging().send(message)
      .then((response) => {
        // Response is a message ID string.
        console.log('Successfully sent message:', response);
        const message = new Message({
          _id: new mongoose.Types.ObjectId(),
           message: messageText,
           date: Date.now(),
           from: phoneNumer,
           to:toPhoneNumber,
           status:"DownStream",
           user_id:data.user_id
          // phone:req.body.phone
         });
         message
           .save()
           .then(result => {
            
             res.status(201).json({
              
               message: "Message Logged",
               status: 200
             });
           })
            .catch(err => {
            console.log(err);
           
          });
        
        res.status(201).json({
        
          message: "Successfully sent message",
          status: 200
        });
      })
      .catch((error) => {
        console.log('Error sending message:', error);
        res.status(500).json({
          message: err,
          status: 500
        });
      });
    });
  
};

var getDevice = function (req,next) {
  console.log('getting device for this phone number.')
  var phoneNumber= req;
  console.log(phoneNumber);
  Device
  .find({ phone: phoneNumber })
  .exec(function(err, device) {
    console.log(device[0]);
   next(device[0]);
  });
};


var ReceiveToGateway = function(dev, next){
 console.log('getting useridfor this phone number.',dev)
 
};


    
module.exports.receivedMessage = function(req,res){
  var dev=req.body.deviceId;
  console.log(dev);
  console.log("Inside receivedMessage");
  Device
  .findOne({ deviceId : dev })
  .exec(function(err,data){
    console.log("error:",err);
    console.log(data);
    User.find({_id:data.user_id})
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "User Not Found",
          status: 401
        });
      }
     else {
          const message = new Message({
             _id: new mongoose.Types.ObjectId(),
              message: req.body.message,
              date: Date.now(),
              from: req.body.from,
              to: data.phone,
              status:"Upstream",
              user_id:data.user_id
             // phone:req.body.phone
            });
            message
              .save()
              .then(result => {
                console.log(user[0]);
                res.status(201).json({
                 
                  callback_webhook:user[0].callback_webhook,
                  textmessage:req.body.message,
                  from:req.body.from,
                  to:data.phone
                  ,
                  message: "Message Received",
                  status: 200
                });
              })
               .catch(err => {
               console.log(err);
               res.status(500).json({
                error: err,
                status: 500
              });
             });
         
        }

    })
   
    });


};


