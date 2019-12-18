document.getElementById("submit").addEventListener("click", function (e) {
    let number = document.getElementById("number").innerText;
    let services = document.getElementsByName("order");
    let orders = [];
    for (let i = 0; i < services.length; i++) {
        orders.push(document.getElementById(i).getAttribute('value'));
    }
    console.log(number);
    console.log(orders);
    // сериализуем данные в json
    let flag = false;
    let data = JSON.stringify({number: number, services: orders, flag:false});
    let request = new XMLHttpRequest();
    // посылаем запрос на адрес 
    request.open("POST", "/manager_order", true);   
    request.setRequestHeader("Content-Type", "application/json");
    request.addEventListener("load", function () {
        let answer = JSON.parse(request.response);
        if (answer) {
            window.location.replace('http://localhost:3000/manager_order');
        }
    });
    request.send(data);
});
document.getElementById("cancel").addEventListener("click", function (e) {
    let number = document.getElementById("number").innerText;
    let services = document.getElementsByName("order");
    let orders = [];
    for (let i = 0; i < services.length; i++) {
        orders.push(document.getElementById(i).getAttribute('value'));
    }
    console.log(number);
    console.log(orders);
    // сериализуем данные в json
    let flag = false;
    let data = JSON.stringify({number: number, services: orders, flag:true});
    let request = new XMLHttpRequest();
    // посылаем запрос на адрес 
    request.open("POST", "/manager_order", true);   
    request.setRequestHeader("Content-Type", "application/json");
    request.addEventListener("load", function () {
        let answer = JSON.parse(request.response);
        if (answer) {
            window.location.replace('http://localhost:3000/manager_order');
        }
    });
    request.send(data);
});