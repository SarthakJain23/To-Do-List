const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require('lodash');
const date = require(__dirname + "/date.js");

// const items = ['Buy Food', 'Cook Food', 'Eat Food'];
// const workItems = [];

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

mongoose.connect('mongodb://localhost:27017/todolistDB', { useNewUrlParser: true });

const itemsSChema = {
    name: String
};

const Item = mongoose.model('Item', itemsSChema);

const item1 = new Item({
    name: 'Welcome to our To Do List.'
});

const item2 = new Item({
    name: 'Hit the + button to add a new item.'
});

const item3 = new Item({
    name: '<-- Hit this to delete an item.'
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSChema]
};

const List = mongoose.model('List', listSchema)
const day = date.getDate();

app.get('/', function (req, res) {

    Item.find({}, (err, foundItems) => {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Succesfuly saved all items');
                }
            });
            res.redirect('/');
        }
        else {
            res.render('List', { listTitle: day, newListItem: foundItems });
        }
    });

});

app.get('/:typeOfList', (req, res) => {
    const typeOfList = _.capitalize(req.params.typeOfList);

    List.findOne({ name: typeOfList }, (err, foundList) => {
        if (!err) {
            if (!foundList) {
                //Create a new List
                const list = new List({
                    name: typeOfList,
                    items: defaultItems
                });

                list.save();
                res.redirect('/' + typeOfList);
            } else {
                //Show an existing List
                res.render('list', { listTitle: typeOfList, newListItem: foundList.items })
            }
        }
    });

});

app.post('/', function (req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if (listName === day) {
        item.save();
        res.redirect('/');
    } else {
        List.findOne({ name: listName }, (err, foundList) => {
            foundList.items.push(item);
            foundList.save();
            res.redirect('/' + listName);
        });
    }
});

app.post('/delete', (req, res) => {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === day) {
        Item.findByIdAndRemove(checkedItemId, (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log('succesfuly removed');
                res.redirect('/');
            }
        });
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, (err, foundList) => {
            if (!err) {
                res.redirect('/' + listName);
            }
        });
    }
});

app.listen(3000, function () {
    console.log('Server started on Port 3000');
});