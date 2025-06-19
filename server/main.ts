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

import { Meteor } from "meteor/meteor";
import { TriviaQuestionCategoryCollection } from "/imports/api/trivia/collections";

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
  console.log("upserting trivia_question_categories...");
  if (TriviaQuestionCategoryCollection.find().count() === 0) {
    for (let category of trivia_question_categories) {
      TriviaQuestionCategoryCollection.upsert({ name: category?.name }, { $set: category });
    }
  }
});

Meteor.startup(() => {
  let countries = [
    "Australia",
    "Austria",
    "Belgium",
    "British Virgin Islands",
    "Burundi",
    "Cambodia",
    "Canada",
    "China",
    "Croatia",
    "Czech Republic",
    "Czechia",
    "East Timor",
    "Fiji",
    "Finland",
    "France",
    "Germany",
    "Greece",
    "Guatemala",
    "Hong Kong",
    "Hungary",
    "India",
    "Indonesia",
    "Italy",
    "Japan",
    "Malaysia",
    "Maldives",
    "Mexico",
    "Netherlands",
    "New Caledonia",
    "New Zealand",
    "Panama",
    "Philippines",
    "Portugal",
    "Rwanda",
    "Singapore",
    "Slovenia",
    "South Africa",
    "South Korea",
    "Spain",
    "Sri Lanka",
    "Sweden",
    "Switzerland",
    "Taiwan",
    "Thailand",
    "Turkey",
    "UAE",
    "United Kingdom",
    "United States",
    "Vatican City",
    "Vietnam",
  ]
  console.log(countries.length, "countries found");
});
