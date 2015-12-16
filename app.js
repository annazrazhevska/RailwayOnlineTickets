//Подключение библиотек
var express = require('express'); 
var bodyParser = require('body-parser');
var uuid = require('node-uuid');
var validate = require('uuid-validate');

var postgres = require('./postgres.js');

//Создание экземпляра класса express
var	app = express();

var port = process.env.PORT || 3000;

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ 
extended: true 
}));

app.use('/public', express.static('public'));
app.use(function (req, res, next) { 
	console.log('%s %s', req.method, req.url);
	next();
});

currentRes = [];
currentID = 0;

var currentPrice;
var numberTrain;
var correntBuyUuidCode;

app.get('/', function(req, res) {
	res.render('index');
});

app.post('/find', function (req, res) {

	postgres.selectIdFromStations(req.body.from, req.body.to)
		.then(
			response => {
				console.log(response);
				postgres.insertToOrdersTable(req.body.nameUser, response.from, response.to, req.body.date, req.body.checkedType)
					.then(
						response => { //Возврат ID заказа в базе
							currentID = response;
							console.log('id in Orders = ' + currentID);
							postgres.functionCompleteVariants(currentID)
								.then(
									response => {
										console.log(response);
										postgres.selectTrainsFromCompatible(currentID)
											.then(
												response => {
													currentRes = response;
													res.render('buy', currentRes);
												},
												error => {
													if (error == '409') {
														res.sendStatus('409');
													} else{
														console.log(error);
													};
												}
											);
									},
									error => {
										console.log(error);
										res.sendStatus('500');
									}
								);
						},
						error => {
							console.log(error);
							res.sendStatus('500');
						}
					);
			},
			error => {
				if (error == '406') {
						console.log('Not found rout!');
						res.sendStatus('406');
				} else {
					console.log(error);
					res.sendStatus('500');
				}
			}
		);

	//console.log(req.body);
});

app.post('/select', function (req, res) {

	console.log(req.body.checkedTrain);

	if (req.body.checkedTrain === undefined) {
		res.sendStatus('406');
	} 
	if (req.body.checkedTrain > 0) {
		var index = req.body.checkedTrain;
		numberTrain = currentRes[index - 1].number;
		console.log(numberTrain);

		postgres.functionCalculatePrice(numberTrain, currentID)
			.then(
				response => {
					console.log(response);
					currentPrice = response;
					res.send(response + ''); 
				},
				error => {
					console.log('Error with select');
					console.log(error);
					res.sendStatus('500');
				}
			);
	};
});

app.post('/buy', function (req, res) {
	
	console.log('buy POST');

	correntBuyUuidCode = uuid.v1();

	console.log(correntBuyUuidCode);

	postgres.functionCompleteBuyedTickets(numberTrain, currentID, currentPrice, correntBuyUuidCode)
		.then(
			response => {
				console.log('buy POST response');
				res.send(correntBuyUuidCode + ''); 
			},
			error => {
				console.log('Error with select');
				console.log(error);
				res.sendStatus('500');
			}

		)
});

app.get('/return', function (req, res) {
	console.log('return get modal');

	res.render('return');
}); 

app.put('/searchUUID', function (req, res) {
	console.log('return PUT');

	var currentUUID = req.body.uuid;

	if (validate(currentUUID)) {
		console.log(req.body.uuid);

		postgres.functionReturnTicket(currentUUID)
			.then(
				response => {
					console.log('searchUUID PUT response');
					res.send(response + ''); 
				},
				error => {
					if (error == '404') {
						console.log('This uuid not found!');
						res.sendStatus('404');
					} else {
						console.log('Error with select');
						console.log(error);
						res.sendStatus('500');
					};
				}
			);

	} else {
		console.log('Не валидный uuid!');
		res.sendStatus('406');
	};

}); 

var server = app.listen(port, function () {
	console.log('Listen on port ' + port);
});