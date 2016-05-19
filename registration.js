function validateForm() {  
    var name = document.getElementById("registerform").uname.value;  
    var password = document.getElementById("registerform").pass.value; 
    var cpassword = document.getElementById("registerform").cpass.value;
    var email = document.getElementById("registerform").email.value;

    if (name == null || name == ""){  
        alert("Name can't be blank");  
        registrationpage.uname.focus()
        return false;  
    } 
    else if (email == null || email == ""){  
        alert("Email can't be blank");  
        registrationpage.email.focus()
        return false;  
    } 
    else if (password.length < 6) {  
        alert("Password must be at least 6 characters long.");  
        return false;  
    }
    else if (password != cpassword) {
        alert("Passwords must match.");
        return false;
    }  
    return true;
}
