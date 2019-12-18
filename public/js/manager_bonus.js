document.getElementById("submit").addEventListener("click", function (e) {
    e.preventDefault();
    // получаем данные формы
    let nameForm = document.forms["bonusForm"];
    if (nameForm.checkValidity()) {
        let number = nameForm.elements["number"].value;
        let bonus = nameForm.elements["bonus"].value;
        // сериализуем данные в json
        let user = JSON.stringify({number:number, bonus:bonus});
        let request = new XMLHttpRequest();
        // посылаем запрос на адрес 
        request.open("POST", "/manager_bonus", true);   
        request.setRequestHeader("Content-Type", "application/json");
        request.addEventListener("load", function () {
            // получаем и парсим ответ сервера
            let answer = JSON.parse(request.response);
            if (answer === "Нет такого пользователя") {
                alert(answer);
            } else {
                window.location.replace('http://localhost:3000/manager_bonus');
            }
        });
        request.send(user);
    } else {
        alert("Неправильный формат данных");
    }
});