document.getElementById("submit").addEventListener("click", function (e) {
    e.preventDefault();
    // получаем данные формы
    let createForm = document.forms["createForm"];
    if (createForm.checkValidity()) {
        let number = createForm.elements["number"].value;
        let password = createForm.elements["password"].value;
        let name = createForm.elements["name"].value;
        // сериализуем данные в json
        let user = JSON.stringify({number: number, password: password, name: name});
        let request = new XMLHttpRequest();
        // посылаем запрос на адрес "/user"
        request.open("POST", "/admin_managercreate", true);   
        request.setRequestHeader("Content-Type", "application/json");
        request.addEventListener("load", function () {
            // получаем и парсим ответ сервера
            let answer = JSON.parse(request.response);
            if (answer === "Номер уже используется") {
                alert(answer);
            } else {
            window.location.replace("http://localhost:3000/admin_cabinet");
            }
        });
        request.send(user);
    } else {
        alert("Неправильный формат данных");
    }
});