function validateForm() {  

    var name = document.getElementById("registerform").uname.value;  
    var password = document.getElementById("registerform").pass.value; 
    var cpassword = document.getElementById("registerform").cpass.value;
    var email = document.getElementById("registerform").email.value;

    if (name == null || name == ""){  
        alert("Name can't be blank");  
        registrationpage.uname.focus();
        document.getElementById("registerform").method = "";
    } 
    else if (email == null || email == ""){  
        alert("Email can't be blank");  
        registrationpage.email.focus();
        document.getElementById("registerform").method = "";

    } 
    else if (password.length < 6) {  
        alert("Password must be at least 6 characters long.");  
        document.getElementById("registerform").method = "";
    }
    else if (password != cpassword) {
        alert("Passwords must match.");
        document.getElementById("registerform").method = "";

    }
    else {
        document.getElementById("registerform").method = "post"; 
    }
}
