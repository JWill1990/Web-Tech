function validateForm() {  

    var uname = document.getElementById("register-form").uname.value;
    var dname = document.getElementById("register-form").dname.value; 
    var password = document.getElementById("register-form").pass.value; 
    var cpassword = document.getElementById("register-form").cpass.value;
    var email = document.getElementById("register-form").email.value;	


    if (uname == null || uname == "") {  
        alert("Name can't be blank");  
        document.getElementById("register-form").method = "";
		  return false;
    } 
    else if (dname == null || dname == "") {
        alert("Display name can't be blank");
        document.getElementById("register-form").method = "";
        return false;
    }
    else if (email == null || email == ""){  
        alert("Email can't be blank");  
        document.getElementById("register-form").method = "";
        return false;
    } 
    else if (password.length < 6) {  
        alert("Password must be at least 6 characters long."); 
        document.getElementById("register-form").method = "";
        return false;
    }
    else if (password != cpassword) {
        alert("Passwords must match.");
        document.getElementById("register-form").method = "";
        return false;
    }
    else {	
        document.getElementById("register-form").method = "post";
    }
}

