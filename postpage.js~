function validateForm() {  

    var name = document.getElementById("post-form").uname.value;
    var message = document.getElementById("post-form").message.value; 

    if (name == null || name == "") {  
        alert("Name can't be blank");  
        document.uname.focus();
        document.getElementById("post-form").method = "";
    } 
    else if (message == null || message == ""){  
        alert("You haven't written anything!");  
        document.message.focus();
        document.getElementById("post-form").method = "";
    } 
    else {
        document.getElementById("post-form").method = "post";
    }
}
