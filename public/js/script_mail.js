document.getElementById("submit").addEventListener("click", function (e) {
             e.preventDefault();
            // получаем данные формы
            let mailForm = document.forms["mailForm"];
            let mail = mailForm.elements["mail"].value;
            // сериализуем данные в json
            let user = JSON.stringify({mail:mail});
            let request = new XMLHttpRequest();
            // посылаем запрос на адрес 
             request.open("POST", "/user_mail", true);   
             request.setRequestHeader("Content-Type", "application/json");
             request.addEventListener("load", function () {
                // получаем и парсим ответ сервера
                 let answer = JSON.parse(request.response);
                 if (answer === "Такая почта уже используется") {
                    alert(answer);
                 }
                 else {
                    window.location.replace('http://localhost:3000/user_mail');
                 }
             });
             request.send(user);
         });