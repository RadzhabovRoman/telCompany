document.getElementById("submit").addEventListener("click", function (e) {
    e.preventDefault();
    // получаем данные формы
    let loginForm = document.forms["regForm"];
    let number = regForm.elements["number"].value;
    let password = regForm.elements["password"].value;
    let name = regForm.elements["name"].value;
    // сериализуем данные в json
    let user = JSON.stringify({number: number, password: password, name: name});
    let request = new XMLHttpRequest();
    // посылаем запрос на адрес "/user"
    request.open("POST", "/user_reg", true);   
    request.setRequestHeader("Content-Type", "application/json");
    request.addEventListener("load", function () {
        // получаем и парсим ответ сервера
        let answer = JSON.parse(request.response);
        if (answer === "Номер уже используется") {
            alert(answer);
        } else {
        window.location.replace("http://localhost:3000/");
        }
    });
    request.send(user);
});