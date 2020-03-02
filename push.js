var webPush = require('web-push');

const vapidKeys = {
	"publicKey":"BAK3oVcszBOE7JkQjA3_bajNo0f6IFzn4JCOwM9BodEfr60R80T5yb2VLDw_IMaqp5phkQybk_i52q-GnNEhkW4",
	"privateKey":"k9vgbVxQG0pjv4V8l6_xCrAVa-VPIqTMy634Ws9pw2c"
};

webPush.setVapidDetails(
	'mailto: diariali0@gmail.com',
	vapidKeys.publicKey,
	vapidKeys.privateKey
);

var pushSubscription = {
	'endpoint': 'https://fcm.googleapis.com/fcm/send/cSJQusAOq2I:APA91bFpfKvdwnU_B0Gaq56j5b_rcOdPq3JvhCgTzIT-7etJehVHqNPKuBxJmtTabQZ4DyoMDcOMDU5LGk9xzcB5PBiP9VNnIT7lmreHyU_DMn1md3gwh67pHydFVV5mT783GxMJEiDj',
	'keys': {
		'p256dh': 'BDc5hxL32nq4Kp7PojmOlf0W2wuH58z1JGETjys+LiFaMSylB2rsUrKCd5iVqRFpXQ0Bopn6FazslfPLPOvFEnc=',
		'auth': 'fpn/l6k+K93h+R3zncoPHw=='
	}
};

var payload = `{
	"title": "Klasemen Updated",
	"badge": "icon-192x192.png",
	"icon": "icon-192x192.png",
  "options": {
    "body": "Klasemen Pertandingan Diperbarui",
    "actions": [
      {
        "action": "yes",
        "title": "Buka Halaman"
      }
    ]
  }
}`;


var options = {
	gcmAPIKey : '168678289067',
	TTL: 60
};

webPush.sendNotification(
	pushSubscription,
	payload,
	options
);