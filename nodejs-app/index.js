const express = require("express");

const app = express();

app.get('/', (req, res) => {
  res.send("Bye there...")
})

app.get('/test', (req, res) => {
  const names = {
    "group 1" : {
      names : [
        {name: "halo", surname: "azy"},
        {name: "emo", surname: "azy"},
        {name: "yamo", surname: "azy"}
      ]
    },
    "group 2" : {
      names : [
        {name: "sulo", surname: "bzy"},
        {name: "cano", surname: "czy"},
        {name: "memo", surname: "dzy"}
      ]
    }
  }
  res.send(names);
});

app.listen(8080, () => {
  console.log("Listening on port 8080")
});
