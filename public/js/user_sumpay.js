document.addEventListener('change', function () {
	//цены
	const price = {};
	price['статический ip'] = 500;
	price['красивый номер'] = 1000;
	price['переадреация'] = 750;
	price['тариф выгодный'] = 400;
	price['тариф  максимум'] = 600;
	price['ip  TV'] = 600;
	price['аренда приставки'] = 20;
	price['аренда роутера'] = 40;
	
	let sumArray = document.getElementsByName("answer");
	let sum = 0;
	for (let i=0; i<sumArray.length; i++) {
	if (sumArray[i].checked) {
		sum+=price[sumArray[i].value];
		}
	}
	document.getElementById('sum').innerHTML = sum;
});