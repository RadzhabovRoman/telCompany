document.getElementById("submit").addEventListener("click", function (e) {
    e.preventDefault();
    // получаем данные формы
    let loginForm = document.forms["loginForm"];
    let number = loginForm.elements["number"].value;
    let password = loginForm.elements["password"].value;
    // сериализуем данные в json
    let user = JSON.stringify({number: number, password: password});
    let request = new XMLHttpRequest();
    // посылаем запрос на адрес "/user"
    request.open("POST", "/user_login", true);   
    request.setRequestHeader("Content-Type", "application/json");
    request.addEventListener("load", function () {
        // получаем и парсим ответ сервера
        let answer = JSON.parse(request.response);
        if (answer === "Неверный логин или пароль") {
            alert(answer);
         } else {
            let number = encodeURIComponent(answer.number);
            let role = encodeURIComponent(answer.role);
            let name = encodeURIComponent(answer.name);
            let numberCookie = 'number' + "=" + number;
            let roleCookie = 'role' + "=" + role;
            let nameCookie = 'name' + "=" + name;
            document.cookie = numberCookie;
            document.cookie = roleCookie;
            document.cookie = nameCookie;
            window.location.replace("http://localhost:3000/user_cabinet");
        }
    });
    request.send(user);
});