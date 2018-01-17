// Generate test code for push notification 
// On Android and iOS
// version: 0.1.0
// Author: Shuo Liang

var Cloud = require('ti.cloud');
var CloudPush = require('ti.cloudpush');

var deviceToken = null;

// login info for test propose
var user = "";
var password = "";
var channel = "TestChannel";
var platform = "ios";

// Differern process for Android and iOS platform
if (Ti.Platform.name == 'android') {
	platform = "android";
	
	CloudPush.retrieveDeviceToken({
		success: deviceTokenSuccess,
		error: deviceTokenError
	});
	
	CloudPush.addEventListener('callback', function(evt) {
		alert('Received push: ' + JSON.stringify(evt));
    	Ti.API.info('Received push: ' + JSON.stringify(evt));
	});
	
} else if (parseInt(Ti.Platform.version.split(".")[0]) >= 8) {
    Ti.App.iOS.addEventListener('usernotificationsettings', function registerForPush() {
 
        Ti.App.iOS.removeEventListener('usernotificationsettings', registerForPush); 
 
        Ti.Network.registerForPushNotifications({
            success: deviceTokenSuccess,
            error: deviceTokenError,
            callback: receivePush
        });
    });
    
    Ti.App.iOS.registerUserNotificationSettings({
	    types: [
            Ti.App.iOS.USER_NOTIFICATION_TYPE_ALERT,
            Ti.App.iOS.USER_NOTIFICATION_TYPE_SOUND,
            Ti.App.iOS.USER_NOTIFICATION_TYPE_BADGE
        ]
    });
} else {
	Ti.Network.registerForPushNotifications({
        types: [
            Ti.Network.NOTIFICATION_TYPE_BADGE,
            Ti.Network.NOTIFICATION_TYPE_ALERT,
            Ti.Network.NOTIFICATION_TYPE_SOUND
        ],
        success: deviceTokenSuccess,
        error: deviceTokenError,
        callback: receivePush
    });
}

function loginUser() {
	Cloud.Users.login({
        login: user,
        password: password
    }, function (e) {
        if (e.success) {
            Ti.API.info('Login successful');
            alert("Login successful");
        } else {
            Ti.API.info('Error:\n' +
                ((e.error && e.message) || JSON.stringify(e)));
        }
    });
}

function subscribeToChannel() {
	Cloud.PushNotifications.subscribeToken({
        channel: channel,
        device_token: deviceToken,
        type: platform
    }, function (e) {
        if (e.success) {
        	alert('Subscribed');
            Ti.API.info('Subscribed');
        } else {
            Ti.API.info('Error:\n' +
                ((e.error && e.message) || JSON.stringify(e)));
        }
    });
}

function unsubscribeToChannel() {
	Cloud.PushNotifications.unsubscribeToken({
        channel: channel,
        device_token: deviceToken
    }, function (e) {
        if (e.success) {
            Ti.API.info('Unsubscribed');
        } else {
            Ti.API.info('Error:\n' +
                ((e.error && e.message) || JSON.stringify(e)));
        }
    });;
}

function deviceTokenSuccess(e) {
	deviceToken = e.deviceToken;
	Ti.API.info("Device Registered Successfully.\nThe Device Token is: " + deviceToken);
	loginUser();
}

function deviceTokenError(e) {
	alert("Failed to register for push notifications!\nThe Error is: " + e.error);
	Ti.API.info("Failed to register for push notifications!\nThe Error is: " + e.error);
}

function receivePush(e) {
    alert('Received push: ' + JSON.stringify(e));
    Ti.API.info('Received push: ' + JSON.stringify(e));
}

var win = Ti.UI.createWindow({
    backgroundColor: 'white',
    layout:'vertical',
    exitOnClose: true
});
 
var subscribe = Ti.UI.createButton({
	title:'Subscribe',
	top: 100,
	left: 100
});
subscribe.addEventListener('click', subscribeToChannel);
win.add(subscribe);
 
var unsubscribe = Ti.UI.createButton({
	title:'Unsubscribe',
	top: 150,
	left: 100
});
unsubscribe.addEventListener('click', unsubscribeToChannel);
win.add(unsubscribe);
 
win.open();
