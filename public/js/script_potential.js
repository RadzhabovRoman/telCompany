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
    if (selectedArray.length === 0 ){
        alert('Ничего не выбрано');
    } else {  
        // сериализуем данные в json
        let data = JSON.stringify({potential: selectedArray});
        let request = new XMLHttpRequest();
        // посылаем запрос на адрес 
        request.open("POST", "/user_potential", true);   
        request.setRequestHeader("Content-Type", "application/json");
        request.addEventListener("load", function () {
        window.location.replace("http://localhost:3000/user_potential");
        });
        request.send(data);
    }   
});