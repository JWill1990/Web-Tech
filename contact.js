function validateForm() {  

    var name = document.getElementById("contactform").contact.value; 
    var email = document.getElementById("contactform").email.value; 
    var subject = document.getElementById("contactform").subject.value;
    var message = document.getElementById("contactform").message.value;
    var emailFilter = /^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+.)+([a-zA-Z0-9]{2,4})+$/;

    if (name == null || name == ""){  
        alert("Name can't be blank");  
        document.getElementById("contactform").method = "";
		  return false;
    }
    else if (!emailFilter.test(email)) {
        alert('Please enter a valid e-mail address.');
        document.getElementById("contactform").method = "";
		  return false;
    }
    else if (subject == null) {
        alert("Please choose a subject");  
        document.getElementById("contactform").method = "";
		  return false;
    }
    else if (message == null) {
        alert("You haven't written anything!");
        document.getElementById("contactform").method = "";
		  return false;
    }
    else {
        document.getElementById("contactform").method = "post"; 
    }
}
