<script>  
	function validateForm(document){  
	    var name = document.getElementsByName(name);  
	    var password = document.pass.value;  
	    var cpassword = document.cpass.value;

	    if (name == null || name == ""){  
	        alert("Name can't be blank");  
	        return false;  
	    } 
        else if (password.length < 6) {  
	        alert("Password must be at least 6 characters long.");  
	        return false;  
	    }
        else if (password != cpassword) {
            alert("Your password does not match!");
            return false;
        }  
    }  
</script>  
