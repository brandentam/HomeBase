const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const https = require("https");
const app = express();
const key = require(__dirname + "/config.js");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser:true});

var usersName = "";
var weatherCity = "";
var weatherTemp = "";
var weatherCond = "";
var imageURL = "";
var apiKey = key;
const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "welcome to your To-Do List!"
});

app.get("/", function(req,res){
  res.sendFile(__dirname + "/index.html");
});



app.get("/initialized",function(req,res){

  console.log(weatherTemp);

  var today = new Date();

  var options = {
    weekday: "long",
    day: "numeric",
    month:"long"
  };

  var day = today.toLocaleDateString("en-US", options);

  Item.find({}, function(err, foundItems){
    res.render("list", {

      name: usersName,
      kindOfDay:day,
      newListItems:foundItems,
      city: weatherCity,
      cityTemp:weatherTemp,
      cityCond:weatherCond,
      imageURL:imageURL


    });
  });

});

app.post("/initialize", function(req, res){

    const query = req.body.cityName;
    weatherCity = req.body.cityName;

    const url = "https://api.openweathermap.org/data/2.5/weather?q="+query+"&appid=" + apiKey;

    usersName = req.body.userName;

    https.get(url, function(response){

      response.on("data", function(data){
        const weatherData = JSON.parse(data);
        weatherTemp = weatherData.main.temp;
        weatherCond = weatherData.weather[0].main;
        const icon = weatherData.weather[0].icon;
        imageURL = "http://openweathermap.org/img/wn/"+icon+"@2x.png"
        res.redirect("/initialized");
      });
    });
});

app.post("/add", function(req, res){
  const itemName = req.body.task;

  const item = new Item({
    name: itemName
  });

  item.save();

  res.redirect("/initialized");
});

app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;

  Item.findByIdAndRemove(checkedItemId, function(err){
    if (err){
      console.log("Could not successfully remove");
    } else {
      console.log("Successfully removed item");
      res.redirect("/initialized");
    }
  });


})

app.listen(3000, function(){
  console.log("Server started on port 3000");
});
