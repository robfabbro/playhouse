import "/imports/api/kelly_pool/methods";
import "/imports/api/kelly_pool/publications";
import "/imports/api/kelly_pool/open_cv";
import "/imports/api/werewolf/methods";
import "/imports/api/werewolf/publications";
import "/imports/api/zilche/methods";
import "/imports/api/zilche/publications";
import "/imports/api/secret_santa/methods";
import "/imports/api/secret_santa/publications";

import { Meteor } from 'meteor/meteor';


if (Meteor.isDevelopment) {
  const httpProxy = require('http-proxy');

  const SSL = function(key, cert, port) {
    const [, , host, targetPort] = Meteor.absoluteUrl().match(/([a-zA-Z]+):\/\/([\-\w\.]+)(?:\:(\d{0,5}))?/);
    console.log(host, targetPort)

    const proxy = httpProxy
      .createServer({
        target: {
          host,
          port: 3000,
        },
        ssl: {
          key,
          cert,
        },
        ws: true,
        xfwd: true,
        secure: true
      })
      .listen(port);

    proxy.on('error', err => {
      console.log(`HTTP-PROXY NPM MODULE ERROR: ${err}`);
    });

    // console.log('PROXY RUNNING ON', port, proxy);
    console.log("SSL Proxy running on: https://localhost:"+port+"/")

  };

  SSL(Assets.getText('localhost.key'), Assets.getText('localhost.cert'), 9000);
}