import "/imports/api/kelly_pool/methods";
import "/imports/api/kelly_pool/publications";
import "/imports/api/kelly_pool/open_cv";
import "/imports/api/werewolf/methods";
import "/imports/api/werewolf/publications";
import "/imports/api/zilche/methods";
import "/imports/api/zilche/publications";
import "/imports/api/secret_santa/methods";
import "/imports/api/secret_santa/publications";
import "/imports/api/fun_facts/methods";
import "/imports/api/fun_facts/publications";
import "/imports/api/bingo/methods";
import "/imports/api/bingo/publications";
import "/imports/api/trivia/methods";
import "/imports/api/trivia/publications";
import "/imports/api/bendemic/methods";
import "/imports/api/bendemic/publications";
import "/imports/api/hive_mind/methods";
import "/imports/api/hive_mind/publications";

import { Meteor } from "meteor/meteor";
import { TriviaQuestionCategoryCollection } from "/imports/api/trivia/collections";
import { HiveMindWordCollection } from "/imports/api/hive_mind/collections";

if (Meteor.isDevelopment) {
  const httpProxy = require("http-proxy");

  const SSL = function (key, cert, port) {
    const [, , host, targetPort] = Meteor.absoluteUrl().match(/([a-zA-Z]+):\/\/([\-\w\.]+)(?:\:(\d{0,5}))?/);
    console.log(host, targetPort);

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
        secure: true,
      })
      .listen(port);

    proxy.on("error", (err) => {
      console.log(`HTTP-PROXY NPM MODULE ERROR: ${err}`);
    });

    // console.log('PROXY RUNNING ON', port, proxy);
    console.log("SSL Proxy running on: https://localhost:" + port + "/");
  };

  SSL(Assets.getText("localhost.key"), Assets.getText("localhost.cert"), 9000);
}

Meteor.startup(() => {
  //Migrating Question Categories
  const trivia_question_categories = JSON.parse(Assets.getText("fixtures/trivia_question_categories.json"));
  if (TriviaQuestionCategoryCollection.find().count() === 0) {
    console.log("upserting trivia_question_categories...");
    for (let category of trivia_question_categories) {
      TriviaQuestionCategoryCollection.upsert({ name: category?.name }, { $set: category });
    }
  }

  //Migrating Hive Mind Words
  const hive_mind_words = Assets.getText("fixtures/hive_mind_words.txt").split("\n");
  if (HiveMindWordCollection.find().count() === 0) {
    console.log("upserting hive_mind_words...");
    for (let word of hive_mind_words) {
      if (word.length >= 3) {
        HiveMindWordCollection.upsert({ word: word }, { $setOnInsert: { createdAt: new Date() } });
      } else {
        console.count(`Skipping short word: ${word}`);
      }
    }
  }
});
