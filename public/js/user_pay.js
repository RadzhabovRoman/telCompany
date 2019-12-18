document.getElementById("submit").addEventListener("click", function (e) {
    e.preventDefault();
    // получаем данные формы
    checkArray = document.getElementsByName("answer");
    let selectedArray = [];
    for (let i=0; i<checkArray.length; i++) {
        if (checkArray[i].checked) {
            selectedArray.push(checkArray[i].value);
        }
    }
    console.log(selectedArray);
    if (selectedArray.length === 0 ){
        alert('Ничего не выбрано');
    } else {  
        // сериализуем данные в json
        let data = JSON.stringify({bought: selectedArray});
        let request = new XMLHttpRequest();
        // посылаем запрос на адрес 
        request.open("POST", "/user_pay", true);   
        request.setRequestHeader("Content-Type", "application/json");
        request.addEventListener("load", function () {
        // получаем и парсим ответ сервера
        let answer = JSON.parse(request.response);
        if (answer === "Недостаточно средств") {
            alert(answer);
        } else {
            window.location.replace('http://localhost:3000/user_pay');
        }
        });
        request.send(data);
    }   
});