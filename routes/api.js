var express = require('express');
var router = express.Router();
var path = require('path');


var db = require('../schema/schema.js');
//var Dora = mongoose.model('dora', doraSchema);
var Dora = db.Dora;
var Users = db.Users;
var Entry = db.Entry;


/* GET users listing. */
router.get('/greet', function (req, res, next) {
    console.log('greet');

    console.log(req.signedCookies._id);
    var search = Users.where({_id: req.signedCookies._id});
    search.findOne(function (err, entry) {
        if (err) {
            return next(err);
        }

        if (entry) {
            return res.send(entry);
        }

        return next();
    });

    //res.send('greetings');
});

router.post('/db', function (req, res, next) {
    var id = req.signedCookies._id;

    Users.findOne({_id: id}, 'name', function(err, user) {
        if (err) return next(err);
        if (!user) return next();

        console.log('post with title ' + req.body.title);
        Entry.find({'userID': id}).where('title').equals(req.body.title).exec(
            function(err, entry) {
                if (err) return next(err);

                console.log('entry is');
                console.log(entry);

                if (!entry || entry.length==0) {
                    console.log('new entry');
                    var store = new Entry({title: req.body.title, data: req.body.data, userID: id});
                    store.save(function(err, store) {
                        if (err) return next(err);
                        if (!store) return next();

                        console.log(store);
                        res.send('saved');
                    });
                } else {
                    console.log('updating entry');
                    entry[0].data = req.body.data;
                    entry[0].save(function(err, elem) {
                        if (err) return next(err);
                        if (!elem) return next();

                        console.log(elem);
                        res.send('updated');
                    });
                }
            }
        );

    });
});

router.get('/db/:title', function(req, res, next) {

    var title = req.params.title;
    var id = req.signedCookies._id;

    Users.findOne({_id: id}, 'name', function(err, user) {
        if (err) return next(err);
        if (!user) return next();

        Entry.find({'userID': id}).where('title').equals(title).exec(
            function(err, entry) {
                console.log('entry found ' + entry);
                if (err) return next(err);
                if(!entry || entry.length==0) return next();

                res.json(entry[0]);
            }
        );

    });
});


router.delete('/db/*', function (req, res, next) {
    var delItem = path.basename(req.originalUrl);
    Dora.findOneAndRemove({name: delItem}, function (err) {
        if (err) return console.log('unable to delete ' + delItem);
        res.send(delItem);
    });

});

module.exports = router;
