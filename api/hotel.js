var validator = require('validator');
var bcrypt = require('bcrypt-nodejs'); //For encryption
var jwt = require("jsonwebtoken");
var fs = require("fs");
var busboy = require('connect-busboy');
var URL = require('../app.js');
var pool = require('./db.js');
var Errors = require('./functions/error.js');
var logger = require('./functions/log.js');
var config = require('./config/config');
var fun = require('./functions/function.js');

exports.bookHotel = function(req, res) {
    logger.info('*** Requested for Authenticating User... ***');
    receivedValues = req.body //RESPONSE FROM WEB
    if (JSON.stringify(receivedValues) === '{}') {
        Errors.EmptyBody(res);
    } else {
        usercolumns = ["email", "phone", "hotelId"];
        for (var iter = 0; iter < usercolumns.length; iter++) {
            columnName = usercolumns[iter];
            if (columnName != "email" || "phone") {
                res.json({ "code": 200, "status": "Error", "message": "email or phone field is undefined" });
                logger.error('*** Redirecting: email or phone field is required');
                return;
            }
            if ((receivedValues[columnName] == undefined || receivedValues[columnName] == "") && (columnName == 'hotelId')) {
                console.log("*** Redirecting: ", columnName, " field is required");
                res.json({ "code": 200, "status": "Error", "message": columnName + " field is undefined" });
                logger.error('*** Redirecting: ', columnName, ' field is required');
                return;
            }
        }
        // this is comes from hotel table where all hotel are there and user will choose any one and it's id will use at here
        var hotelId = req.body.hotelId;

        pool.connect(function(db) {
            if (db) {
                users = db.collection('users');
                hotels = db.collection('hotels');
                userHotel = db.collection('UserHotel');

                users.find({ $or: [{ email: req.body.email }, { phone: req.body.phone }] }).toArray(
                    function(err, userFind) {
                        if (!err) {
                            if (userFind.length > 0) {
                                // User alredy book before hotel
                                console.log('userFind', userFind);
                                var userId = userFind._id;
                                var userHotelDetails = [hotelId = hotelId, userId = userId];

                                UserHotel.insert(userHotelDetails, function(err, userIns) {
                                    if (!err) {
                                        console.log('Hotel book successfully...');
                                        res.json({ 'code': 200, 'status': 'success', 'message': 'Hotel book successfully' });
                                        return;
                                    } else {
                                        console.log('Error for insert hotel details', err);
                                        res.json({ 'code': 200, 'status': 'error', 'message': 'Error for hotel book' });
                                        return;
                                    }
                                });
                            } else {
                                // User is new 
                                var userDetails = [hotelId = hotelId, email = req.body.email, phone = req.body.phone, name = req.body.name];
                                // user had booked hotel alredy
                                users.insert(userDetails,
                                    function(err, userIns) {
                                        if (!err) {
                                            console.log('User crate success');
                                            var userHotelDetails = [hotelId = hotelId, userId = userIns._id];
                                            UserHotel.insert(userHotelDetails, function(err, userIns) {
                                                if (!err) {
                                                    console.log('Hotel book successfully...');
                                                    res.json({ 'code': 200, 'status': 'success', 'message': 'Hotel book successfully' });
                                                    return;
                                                } else {
                                                    console.log('Error for insert hotel details', err);
                                                    res.json({ 'code': 200, 'status': 'error', 'message': 'Error for hotel book' });
                                                    return;
                                                }
                                            });
                                        } else {
                                            console.log('Erro for create new user', err);
                                            res.json({ 'code': 200, 'status': 'error', 'message': 'Error for create new user' });
                                            return;
                                        }
                                    });
                            }
                        } else {
                            console.log('Error for user find', err);
                            res.json({ 'code': 200, 'status': 'error', 'message': 'Error for find user' });
                            return;
                        }
                    });
            } else {
                console.log('Connection Error');
                res.json({ 'code': 200, 'status': 'error', 'message': 'Connection Error' });
                return;
            }
        });
    }
}

// table users : id,email,phone,name
// hotels:id,hotelName,...
// UserHotel:userId,hotelId