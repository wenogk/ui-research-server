// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();
const {runMain} = require("./main.js");
var bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
// https://expressjs.com/en/starter/basic-routing.html
app.get("/run", async (request, response) => {
  //response.send(request.body.settings)
  //return response.json(request.query)
  if(request.query.api_key == "nyuaddauyn") {
    //let settings = request.body.settings
    let filteredValue = true;
    if(request.query.filtered == "true") {
       filteredValue = true;
    } else if (request.query.filtered == "false") {
      filteredValue = false;
    }
    const settings = {
  
    url: request.query.url,
    screenHeight : parseInt(request.query.screenHeight),
    screenWidth : parseInt(request.query.screenWidth),
    getScriptSource : false,
    colors: {
      defaultEventBorderColor : "green",
      loadEventBorderColor: "red",
      clickEventBorderColor: "blue",
    },
    ignoreNormalLinks : true,
    filtered : filteredValue
}
   //return response.json(settings)
    const dataResult = await runMain(settings);
    response.send(dataResult);
  } else {
    response.sendStatus(401)
  }
  
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
