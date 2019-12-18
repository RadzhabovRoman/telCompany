document.getElementById("submit").addEventListener("click", function (e) {
    e.preventDefault();
    // получаем данные формы
    let deleteForm = document.forms["deleteForm"];
    if (deleteForm.checkValidity()) {
        let number = deleteForm.elements["number"].value;
        // сериализуем данные в json
        let user = JSON.stringify({number:number});
        let request = new XMLHttpRequest();
        // посылаем запрос на адрес 
        request.open("POST", "/admin_userdelete", true);   
        request.setRequestHeader("Content-Type", "application/json");
        request.addEventListener("load", function () {
            // получаем и парсим ответ сервера
            let answer = JSON.parse(request.response);
            if (answer === "Нет такого пользователя") {
                alert(answer);
            } else {
                window.location.replace('http://localhost:3000/admin_userdelete');
            }
        });
        request.send(user);
    } else {
        alert("Неправильный формат данных");
    }
});