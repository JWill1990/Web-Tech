function validateForm() {  

    var name = document.getElementById("register-form").uname.value;
    var name = document.getElementById("register-form").dname.value; 
    var password = document.getElementById("register-form").pass.value; 
    var cpassword = document.getElementById("register-form").cpass.value;
    var email = document.getElementById("register-form").email.value;	


    if (name == null || name == "") {  
        alert("Name can't be blank");  
        document.uname.focus();
        document.getElementById("register-form").method = "";
    } 
    else if (dname == null || dname == "") {
        alert("Display name can't be blank");
        document.dname.focus();
        document.getElementById("register-form").method = "";
    }
    else if (email == null || email == ""){  
        alert("Email can't be blank");  
        document.email.focus();
        document.getElementById("register-form").method = "";
    } 
    else if (password.length < 6) {  
        alert("Password must be at least 6 characters long."); 
	document.password.focus(); 
        document.getElementById("register-form").method = "";
    }
    else if (password != cpassword) {
        alert("Passwords must match.");
	document.cpassword.focus();
        document.getElementById("register-form").method = "";
    }
    else {
        document.getElementById("register-form").method = "post";
    }
}
