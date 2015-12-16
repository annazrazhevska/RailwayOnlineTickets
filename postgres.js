var pg = require('pg');
var Client = require('pg').Client; 
var conString = "postgres://postgres:14541454@localhost/railway";

var client = new Client(conString);
    client.connect();

var postgres = {
	selectIdFromStations: function(stationFrom, stationTo) {

		return new Promise(function(resolve, reject) {
			var stationID = {};

			var query1 = client.query("SELECT id FROM Stations WHERE name = $1", [stationFrom]);
		    query1.on('row', function(row) {
		      stationID.from = row.id;
		    });
		    var query2 = client.query("SELECT id FROM Stations WHERE name = $1", [stationTo]);
		    query2.on('row', function(row) {
		      stationID.to = row.id;
		    });
		    client.on('drain', function() {
		    	if (!stationID.from || !stationID.to) {
		    		reject('406'); //Not found rout!
		    	} else {
		    		resolve(stationID);
		    	}
		    });
		    client.on('error', function(error) {
		      	reject(error);
		    });	
		});
	},
	insertToOrdersTable: function(name, stationIDFrom, stationIDTo, date, wagonType) {
		
		return new Promise(function(resolve, reject) {
			var userId;

			var query = client.query("INSERT INTO Orders(client_name, station_from, station_to, date, wagon_type) VALUES ($1,$2,$3,$4,$5) RETURNING id", [name, stationIDFrom, stationIDTo, date, wagonType]);
		    query.on('row', function(row) {
		      	userId = row.id;
		        //userId = 17;
		    });
		    client.on('drain', function() {
		    	resolve(userId);
		    });
		    client.on('error', function(error) {
		      	reject(error);
		    });	
		});
    //query.on('end', client.end.bind(client)); //disconnect client manually
	},
	functionCompleteVariants: function(userId) {

		return new Promise(function(resolve, reject) {

			var query = client.query("SELECT CompleteVariants($1)", [userId]);

		    client.on('drain', function() {
		    	resolve('CompleteVariants success!');
		    });
		    client.on('error', function(error) {
		      	reject(error);
		    });	
		});
	},
	selectTrainsFromCompatible: function(userId) {

		return new Promise(function(resolve, reject) {

			var compatibleTrains = [];

			var query = client.query("SELECT DISTINCT Trains.number, Trains.station_from_name, Trains.station_to_name, Timetable.time_from,Timetable.time_to, CAST(Timetable.date AS VARCHAR), Compatible_trains.places_num FROM Compatible_trains JOIN (Trains JOIN Waybill ON Waybill.id_train=Trains.id JOIN Timetable ON Timetable.id_train=Trains.id) ON Compatible_trains.train_id=Trains.id WHERE Compatible_trains.id_order = $1 AND Timetable.id = Compatible_trains.timetable_id", [userId]);
			query.on('row', function(row) {
		      	compatibleTrains.push(row);
		    });
		    client.on('drain', function() {
		    	if (compatibleTrains.length == 0) {
		    		reject('409') //Conflict, this train block.
		    	} else{
		    		resolve(compatibleTrains);
		    	};
		    });
		    client.on('error', function(error) {
		      	reject(error);
		    });	
		});
	},
	functionCalculatePrice: function (numberTrain, userId) {

		return new Promise(function(resolve, reject) {

			var price;

			var query = client.query("SELECT calculatePrice($1,$2)", [numberTrain, userId]);
			query.on('row', function(row) {
		      	console.log(row);
		      	price = row.calculateprice;
		    });
		    client.on('drain', function() {
		    	console.log('drain price calcul');
		    	resolve(price);
		    });
		    client.on('error', function(error) {
		      	reject(error);
		    });	
		});
	},
	functionCompleteBuyedTickets: function(numberTrain, userId, ticketPrice, uuidCode) {

		return new Promise(function(resolve, reject) {

			var query = client.query("SELECT completeBuyedTickets($1,$2,$3,$4)", [numberTrain, userId, ticketPrice, uuidCode]);
		    client.on('drain', function() {
		    	console.log('drain functionCompleteBuyedTickets');
		    	resolve('200');
		    });
		    client.on('error', function(error) {
		      	reject(error);
		    });	

		});
	},
	functionReturnTicket: function(uuid) {

		return new Promise(function(resolve, reject) {

			var returnPrice;

			var query = client.query("SELECT ReturnTicket($1)", [uuid]);
		    query.on('row', function(row) {
		      	console.log(row);
		      	returnPrice = row.returnticket;
		    });
		    client.on('drain', function() {
		    	console.log('drain functionReturnTicket');
		    	if (returnPrice) {
		    		resolve(returnPrice);
		    	} else{
		    		reject('404');
		    	};
		    });
		    client.on('error', function(error) {
		      	reject(error);
		    });	

		});
	}
}


module.exports = postgres;