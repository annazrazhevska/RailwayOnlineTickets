$(document).ready(function(){

	$('.datepicker').pickadate({
    	selectMonths: true, // Creates a dropdown to control month
    	selectYears: 15 // Creates a dropdown of 15 years to control year
  	});

	$("#find").click(function(event) {
		console.log('find click');

		if (validation()) {
			$.ajax({
		   		type: "POST",
		   		url: "/find",
		   		data: {
		   			nameUser: $('input[name="nameUser"]').val(),
		   			from: $('input[name="from"]').val(),
		   			to: $('input[name="to"]').val(),
		   			date: $('input[name="date"]').val(),
		   			checkedType: $('input[name="checkedType"]:checked').val()
		   		},
		   		beforeSend: function() {
		   			$('#modalProgress').openModal();
		   		},
		   		success: function(msg) {
		   			 Materialize.toast('Список поездов успешно сформирован. Выберите, и нажмите "Обрати"', 4000);
		   			 console.log(msg);
		   			 
		   			 $('#modalProgress').closeModal();
		   			 $('#modalForInsert').html(msg);
		   			 $('#modalMain').openModal();
		   			 $('.complTrainTab').removeClass("hide");

		   			 readyForBuy();
		   		},
		   		error: function(msg) {
		   			 $('#modalProgress').closeModal();
		   			console.log('error');
		   			if (msg.status == 406) {
		   				Materialize.toast('На эту дату поездов по выбранному маршруту нет!', 4000);
		   			}
		   			if (msg.status == 409) {
		   				Materialize.toast('Билеты по данному маршруту заблокированы, попробуйте чуть позже!', 4000);
		   			}
		   			if (msg.status == 500) {
		   				Materialize.toast('Ошибка на сервере. Повторите позже.', 4000);
		   			}
		   		}
 			});
		} else {
			Materialize.toast('Заполните все поля!', 4000);
		}	
 	});

	$("#return").click(function(event) {
		console.log('return click');

		$.ajax({
	   		type: "GET",
	   		url: "/return",
	   		beforeSend: function() {
	   			//$('#modalProgress').openModal();
	   		},
	   		success: function(msg) {
	   			console.log(msg);

	   			$('#modalForInsert').html(msg);
	   			$('#modalMain').openModal();

	   			readyForReturn();
	   		},
	   		error: function(msg) {
	   			// $('#modalProgress').closeModal();
	   			console.log('error');
	   			console.log(msg);
	   			
	   			if (msg.status == 500) {
	   				Materialize.toast('Ошибка на сервере. Повторите позже.', 4000);
	   			}
	   		}
		});
 	});
});

function validation () {
	nameUser = $('input[name="nameUser"]').val();
	from = $('input[name="from"]').val();
	to = $('input[name="to"]').val();
	date = $('input[name="date"]').val();

	if (nameUser && from && to && date) {
		return 1;
	} else {
		return 0; //ВКЛЮЧИТЬ НА 0, выключено для тестов!!!! №№№№№№№№№№№№№№№№№№№
	}
}

function readyForBuy () {
	$(document).ready(function(){

		$("#select").click(function(event) {
			console.log('select click');

				$.ajax({
		   		type: "POST",
		   		url: "/select",
		   		data: {
		   			checkedTrain: $('input[name="checkedTrain"]:checked').val()
		   		}, 
                complete: function(msg) {
                  //called when complete
                  console.log('select process complete');
                  console.log(msg);
                },
		   		success: function(msg) { 

		   			console.log('success select.click()');
		   			console.log(msg);
		   			Materialize.toast('Если вы определились с выбором, нажмите кнопку "Купить"', 4000);
		   			
		   			$('p.price').removeClass("hide");
		   			$('#forPrice').html(msg);
		   			$('#buy').removeClass("disabled");
		   			
		   		},
		   		error: function(msg) {
		   			// $('#modalProgress').closeModal();
		   			console.log('error ajax in select.click()');
					
		   			if (msg.status == 406) {
		   				Materialize.toast('Выберите один из поездов!', 4000);
		   			}
		   			if (msg.status == 500) {
	   					Materialize.toast('Ошибка на сервере. Повторите позже.', 4000);
	   				}
		   			//console.log(msg);
		   			//Materialize.toast(msg, 4000);
		   		}
 			});
	 	});

		$("#buy").click(function(event) {
			console.log('buy click');

				$.ajax({
		   		type: "POST",
		   		url: "/buy",
		   		data: {
		   			checkedTrain: $('input[name="checkedTrain"]:checked').val()
		   		}, 
                complete: function(msg) {
                  //called when complete
                  console.log('buy process complete');
                  console.log(msg);
                },
		   		success: function(msg) { 

		   			console.log('success buy.click()');
		   			console.log(msg);

		   			$('.complTrainTab').addClass("hide");
		   			$('#forUuid').html(msg);
					$('.card.uuid').removeClass("hide");

		   			Materialize.toast('Вы успешно купили билет!', 4000);
		   			
		   		},
		   		error: function(msg) {
		   			// $('#modalProgress').closeModal();
		   			console.log('error ajax in buy.click()');
					
		   			if (msg.status == 500) {
	   					Materialize.toast('Ошибка на сервере. Повторите позже.', 4000);
	   				}
		   			//console.log(msg);
		   			//Materialize.toast(msg, 4000);
		   		}
 			});
	 	});
	 	$("#uuidCardBtn").click(function(event) {

	 		console.log('uuidCardBtn.click()');
	 		window.location='/'

	 	});
	});
};

function readyForReturn () {
	$(document).ready(function(){

		$("#searchUUID").click(function(event) {
			console.log('searchUUID click');

			$.ajax({
	   		type: "PUT",
	   		url: "/searchUUID",
	   		data: {
	   			uuid: $('input[name="uuid"]').val()
	   		}, 
            complete: function(msg) {
              //called when complete
              console.log('buy process complete');
              console.log(msg);
            },
	   		success: function(msg) { 

	   			console.log('success buy.click()');
	   			console.log(msg);
 
	   			$('.returnTicketForma').addClass("hide");
		   		$('#forReturnPrice').html(msg);
				$('.returnuuid.hide').removeClass("hide");

	   			Materialize.toast('Вы успешно вернули билет!', 4000);
	   			
	   		},
	   		error: function(msg) {
	   			// $('#modalProgress').closeModal();
	   			console.log('error ajax in buy.click()');
				if (msg.status == 406) {
   					Materialize.toast('Введите валидный идентификатор UUID', 4000);
   				}
   				if (msg.status == 404) {
   					Materialize.toast('Билета с таким идентификатором UUID в базе не найденно!', 4000);
   				}
	   			if (msg.status == 500) {
   					Materialize.toast('Ошибка на сервере. Повторите позже.', 4000);
   				}
	   		}
			});
 		});
		$("#uuidCardBtn").click(function(event) {

	 		console.log('uuidCardBtn.click()');
	 		window.location='/'

	 	});
	});
};