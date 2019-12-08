document.addEventListener('change', function () {
	price = {};
	price['static ip'] = 100;
	price['good number 500'] = 500;
	price['tarif1'] = 200;
	price['tarif2'] = 300;
	
	let sumArray = document.getElementsByName("answer");
	let sum = 0;
	for (let i=0; i<sumArray.length; i++) {
	if (sumArray[i].checked) {
		sum+=price[sumArray[i].value];
		}
	}
	document.getElementById('sum').innerHTML = sum;
});