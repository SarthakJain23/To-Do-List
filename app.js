const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

const items = ['Buy Food', 'Cook Food', 'Eat Food'];
const workItems = [];

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');


app.get('/', function (req, res) {

    const day = date.getDate();

    res.render('List', { listTitle: day, newListItem: items });
});

app.post('/', function (req, res) {
    const itemName = req.body.newItem;

    if (req.body.list === 'Work') {
        workItems.push(itemName);
        res.redirect('/work');
    } else {
        items.push(itemName);
        res.redirect('/');
    }

});

app.get('/work', function (req, res) {
    res.render('List', { listTitle: 'Work List', newListItem: workItems });
});

app.listen(3000, function () {
    console.log('Server started on Port 3000');
});