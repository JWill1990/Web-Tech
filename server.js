// Run a node.js web server for local development of a static web site.
// Put this program in a site folder and start with "node server.js".
// Then visit the site at the address printed on the console.
// The server is configured to encourage portable web sites.
// In particular, URLs are lower cased so the server is case insensitive even
// on Linux, and paths containing upper case letters are banned so that the
// file system is treated as case sensitive, even on Windows.

// Load the library modules, and define the response codes:
// see http://en.wikipedia.org/wiki/List_of_HTTP_status_codes.
// Define the list of banned urls, and the table of file types, and run tests.
// Then start the server on the given port: use the default 80, or use 8080 to
// avoid privilege or port number clash problems or to add firewall protection.
var http = require('http');
var fs = require('fs');
var QS = require("querystring");
var passwordHash = require('password-hash');
var nodemailer = require("nodemailer");
var smtpTransport = require('nodemailer-smtp-transport');
var OK = 200, NotFound = 404, BadType = 415, Error = 500;
var banned = defineBanned();
var types = defineTypes();
"use strict";
var sql = require("sqlite3");
test();
start(8080);

// Start the http service.  Accept only requests from localhost, for security.
// Print out the server address to visit.
function start(port) {
    var httpService = http.createServer(handle);
    httpService.listen(port, 'localhost');
    var address = "http://localhost";
    if (port != 80) address = address + ":" + port;
    console.log("Server running at", address);
}

// Serve a request.  Process and validate the url, then deliver the file.
function handle(request, response) {
    var url = request.url;
    var query = getQuery(request.url);
    url = removeQuery(url);
    url = lower(url);
    url = addIndex(url);
    if (! valid(url)) return fail(response, NotFound, "Invalid URL");
    if (! safe(url)) return fail(response, NotFound, "Unsafe URL");
    if (! open(url)) return fail(response, NotFound, "URL has been banned");
    var type = findType(url);
    if (type == null) return fail(response, BadType, "File type unsupported");
    if (type == "text/html") type = negotiate(request.headers.accept);
    if (request.method == 'POST') {
        if (request.url.indexOf('/registrationpage.html') == 0) {
            registrationHandle(request, response);        
        }
        if (request.url.indexOf('/contactpage.html') == 0) {
            contactHandle(request, response);    
        }
        if (request.url.indexOf('/postpage.html') == 0) {
            postHandle(request, response);
        }
    }    
    else if (request.method == 'GET' && request.url.indexOf('/users.html') == 0) {
        usersHandle(request, response);
    }
    else if (request.method == 'GET' && request.url.indexOf('/user') == 0) {
        userHandle(request, response, query);
    }
    else if (request.method == 'GET' && request.url.indexOf('/upd8s') == 0 &&
             query != "") {
        feedHandle(request, response, query);
    }
    else {
        reply(response, url, type);
    }
}

//Handles the contact submission form, parsing the body upon a POST request and calls mailUs
function contactHandle(request, response) {
    request.on('data', add);
    request.on('end', end);
    var body = "";
    
    function add(chunk) {
        body = body + chunk.toString();
    }
    function end() {
        var params = QS.parse(body);
        mailUs(params.contact, params.email, params.subject, params.message);
        var hdrs = { 'Content-Type': '' };
        response.writeHead(200, hdrs);
        response.write("<h1>Thank you for contacting uPd8. We will be in touch.</h1>");
        response.write('<a href="index.html"> Return to uPd8 </a>');
        response.end();
    }    
}

//Handles registering a new user
function registrationHandle(request, response) {
    request.on('data', add);
    request.on('end', end);
    var body = "";
    
    function add(chunk) {
        body = body + chunk.toString();
    }

    var db = new sql.Database("database.sqlite3");
    function end() {
        var params = QS.parse(body);
        var ps = db.prepare(
            "INSERT INTO Person VALUES (null,?,?,?,?)"
        );
        var hashedPassword = passwordHash.generate(params.pass);
        ps.run(params.uname, hashedPassword, params.dname, params.email, function (err) {
            if (err) {
                response.write("<h1>Username already exists!</h1>");
                response.write('<a href="index.html"> Return to uPd8 </a>');
                response.end(); 
                ps.finalize();
                db.close();
                return;
            }
            else {                	
                ps.finalize();
                db.close();
                var hdrs = { 'Content-Type': '' };
                response.writeHead(200, hdrs);
                response.write("<h1>Welcome to uPd8!</h1>");
                response.write("<h3>Please let us know of any bugs you encounter. The uPd8 team will be in touch as soon as possible!<h3>");
                response.write('<a href="index.html"> Return to uPd8 </a>');
                response.end(); 
            }
        });             
    }
}

/*function loginHandle(request, response) {
    request.on('data', add);
    request.on('end', end);
    var body = "";
    
    function add(chunk) {
        body = body + chunk.toString();
    }
    console.log("Here");
    var db = new sql.Database("database.sqlite3");
    function end() {
        var params = QS.parse(body);
        var ps = db.prepare(
            "SELECT uname, pword FROM Person WHERE name = ? AND pword = ?"
        );
        ps.run(params.uname, params.pass, function (err) {
            if (err) {
                response.write("<h1>Sorry, this account does not exist!</h1>");
                response.write('<a href="postpage.html"> Return to uPd8 </a>');
                response.end(); 
                ps.finalize();
                db.close();
                return;
            }
            else {		
                ps.finalize();
                db.close();
                var hdrs = { 'Content-Type': '' };
                response.writeHead(200, hdrs);
                response.write("<h1>Welcome " + params.uname + "!</h1>");
                response.write('<a href="index.html"> Return to uPd8 </a>');
                response.end(); 
            }
        }); 
    }
}*/

function feedHandle(request, response, query){
    var db = new sql.Database("database.sqlite3");
    var ps0 = db.prepare(
        "SELECT id FROM Person WHERE uname=?"
    );
    ps0.all(query, function (err, res) {
        var userId = res[0].id;
        ps0.finalize();
        var ps = db.prepare(
            "SELECT uname, dname, message, url, postedAt " +
            "FROM Person AS p JOIN Upd8 AS u " +
            "ON p.id=u.poster " +
            "JOIN Follows AS f " +
            "ON u.poster=f.followee " +
            "WHERE f.follower = ? " +
            "ORDER BY u.postedAt DESC"
        );
        ps.all(userId, function(err, rows) {
            var html = pageHead();
            html += '<div class="general">';
            html += postUpd8Form();
            html += '<section class="right"><h1>upd8s for '+query+'</h1>';
            for(var i = 0; i < rows.length; i++){
                html += genUpd8(rows[i].dname, rows[i].message, rows[i].url, rows[i].postedAt);
            }
            ps.finalize();
            db.close();
            html += '</section></div>';
            html += pageFoot();
            response.write(html);
            response.end(); 
        });
    });
}


function userHandle(request, response, query){
    var db = new sql.Database("database.sqlite3");
    var ps = db.prepare(
        "SELECT uname, dname, message, url, postedAt " +
        "FROM Person AS p JOIN Upd8 AS u " +
        "ON p.id=u.poster " +
        "WHERE p.uname = ? " +
        "ORDER BY u.postedAt DESC"
    );
    ps.all(query, function(err, rows) {
        var html = pageHead();
        html += '<div class="general"><h1>upd8s from '+rows[0].dname+'</h1>';
        for(var i = 0; i < rows.length; i++){
            html += genUpd8(rows[i].dname, rows[i].message, rows[i].url, rows[i].postedAt);
        }
        ps.finalize();
        db.close();
        html += '</div>';
        html += pageFoot();
        response.write(html);
        response.end(); 
    });
}

function genUpd8(dname, message, url, postedAt){
    var html = '<div class="upd8"><h1>'+dname+'</h1>';
    html += '<p>'+message+'</p>';
    html += '<p>'+url+'</p>';
    html += '<p>'+postedAt+'</p>';
    html += '</div>';
    return html;
}

function usersHandle(request, response){
    var db = new sql.Database("database.sqlite3");
    var ps = db.prepare(
        "SELECT uname, dname FROM Person"
    );
    ps.all(function(err, rows) {
        var html = pageHead();
        html += '<div class="general"><h1>List of Users</h1><hr/><ul id="userList">';
        for(var i = 0; i < rows.length; i++){
            html += '<p><a href="user.html?'+rows[i].uname+'">';
            html += rows[i].uname+' - '+rows[i].dname+'</a></p>';
        }
        ps.finalize();
        db.close();
        html += '</ul></div>';
        html += pageFoot();
        response.write(html);
        response.end(); 
    });
}

function postHandle(request, response) {
    request.on('data', add);
    request.on('end', end);
    var body = "";
    
    function add(chunk) {
        body = body + chunk.toString();
    }
    var postTime = new Date();

    var db = new sql.Database("database.sqlite3");
    function end() {
        var params = QS.parse(body);
        var ps0 = db.prepare(
            "SELECT id FROM Person WHERE uname=?"
        );
        ps0.all(params.uname, function (err, res) {
            var userId = res[0].id;
            ps0.finalize();
            var ps = db.prepare(
                "INSERT INTO Upd8 VALUES (null,?,?,?,?)"
            );
            ps.run(userId, params.message, params.url, postTime, function (err) {
                if (err) {
                    response.write("<h1>Sorry, your uPd8 could not be posted! Please check input parameters</h1>");
                    response.write('<a href="postpage.html"> Return to uPd8 </a>');
                    response.end(); 
                    ps.finalize();
                    db.close();
                    return;
                }
                else {		
                    ps.finalize();
                    db.close();
                    var hdrs = { 'Content-Type': '' };
                    response.writeHead(200, hdrs);
                    response.write("<h1>Your uPd8 has been accepted!</h1>");
                    response.write('<a href="index.html"> Return to uPd8 </a>');
                    response.end(); 
                }
            });
        });             
    }
}


//Creates a transporter object, sends email to uPd8
function mailUs(contact, email, subject, message) {
    var options = {
        service: "gmail",
        auth: {
            user: "upd8customerservice@gmail.com",
            pass: "webtech1"
        }
    };

    var transporter = nodemailer.createTransport(smtpTransport(options))

    var mail = {
        to: "upd8customerservice@gmail.com",
        subject: subject,
        text: message + "\n\n" + "From " + contact,
        cc: email
    }

    transporter.sendMail(mail, function(error, response){
        if(error){
            console.log(error);
        }else{
            console.log("Message sent:");
        }

        transporter.close();
    });
}

// Remove the query part of a url.
function removeQuery(url) {
    var n = url.indexOf('?');
    if (n >= 0) url = url.substring(0, n);
    return url;
}

function getQuery(url) {
    var res = url.split('?');
    if(res[1]) {
        return res[1];
    }
    return '';
}

// Make the url lower case, so the server is case insensitive, even on Linux.
function lower(url) {
    return url.toLowerCase();
}

// If the url ends with / add index.html.
function addIndex(url) {
    if (ends(url, '/')) url = url + "index.html";
    return url;
}

// Validate the URL.  It must start with / and not contain /. or // so
// that /../ and /./ and file or folder names starting with dot are excluded.
// Also a final name with no extension is rejected.
function valid(url) {
    if (! starts(url, "/")) return false;
    if (url.indexOf("//") >= 0) return false;
    if (url.indexOf("/.") >= 0) return false;
    if (ends(url, "/")) return true;
    if (url.lastIndexOf(".") < url.lastIndexOf("/")) return false;
    return true;
}

// Restrict the url to visible ascii characters, excluding control characters,
// spaces, and unicode characters beyond ascii.  Such characters aren't
// technically illegal, but (a) need to be escaped which causes confusion for
// users and (b) can be a security risk.
function safe(url) {
    var spaceCode = 32, deleteCode = 127;
    if (url.length > 1000) return false;
    for (var i=0; i<url.length; i++) {
        var code = url.charCodeAt(i);
        if (code > spaceCode && code < deleteCode) continue;
        return false;
    }
    return true;
}

// Protect any resources which shouldn't be delivered to the browser.
function open(url) {
    for (var i=0; i<banned.length; i++) {
        var ban = banned[i];
        if (url == ban || ends(ban, "/") && starts(url, ban)) {
            return false;
        }
    }
    return true;
}

// Find the content type to respond with, or undefined.
function findType(url) {
    var dot = url.lastIndexOf(".");
    var extension = url.substring(dot);
    return types[extension];
}

// Do content negotiation, assuming all pages on the site are XHTML and
// suitable for dual delivery.  Check whether the browser claims to accept the
// XHTML type and, if so, use that instead of the HTML type.
function negotiate(accept) {
    var htmlType = "text/html";
    var xhtmlType = "application/xhtml+xml";
    var accepts = accept.split(",");
    if (accepts.indexOf(xhtmlType) >= 0) return xhtmlType;
    else return htmlType;
}

// Read and deliver the url as a file within the site.
function reply(response, url, type) {
    var file = "." + url;
    fs.readFile(file, deliver.bind(null, response, type));
}

// Deliver the file that has been read in to the browser.
function deliver(response, type, err, content) {
    if (err) return fail(response, NotFound, "File not found");
    var typeHeader = { 'Content-Type': type };
    response.writeHead(OK, typeHeader);
    response.write(content);
    response.end();
}

// Give a minimal failure response to the browser
function fail(response, code, text) {
    var textTypeHeader = { 'Content-Type': 'text/plain' };
    response.writeHead(code, textTypeHeader);
    response.write(text, 'utf8');
    response.end();
}

// Check whether a string starts with a prefix, or ends with a suffix.  (The
// starts function uses a well-known efficiency trick.)
function starts(s, x) { return s.lastIndexOf(x, 0) == 0; }
function ends(s, x) { return s.indexOf(x, s.length-x.length) >= 0; }

// Avoid delivering the server source file.  Also call banUpperCase.
function defineBanned() {
    var banned = ["/server.js"];
    banUpperCase(".", banned);
    return banned;
}

// Check a folder for files/subfolders with non-lowercase names.  Add them to
// the banned list so they don't get delivered, making the site case sensitive,
// so that it can be moved from Windows to Linux, for example. Synchronous I/O
// is used because this function is only called during startup.  This avoids
// expensive file system operations during normal execution.  A file with a
// non-lowercase name added while the server is running will get delivered, but
// it will be detected and banned when the server is next restarted.
function banUpperCase(folder, banned) {
    var folderBit = 1 << 14;
    var names = fs.readdirSync(folder);
    for (var i=0; i<names.length; i++) {
        var name = names[i];
        var file = folder + "/" + name;
        if (name != name.toLowerCase()) {
            banned.push(file.substring(1));
        }
        var mode = fs.statSync(file).mode;
        if ((mode & folderBit) == 0) continue;
        banUpperCase(file, banned);
    }
}

// The most common standard file extensions are supported.
// Some common non-standard file extensions are explicitly excluded.
// This table is defined using a function rather than just a global variable,
// because otherwise the table would have to appear before calling start().
function defineTypes() {
    return {
    '.html' : 'text/html',    // old browsers only, see negotiate
    '.css'  : 'text/css',
    '.js'   : 'application/javascript',
    '.png'  : 'image/png',
    '.gif'  : 'image/gif',    // for images copied unchanged
    '.jpeg' : 'image/jpeg',   // for images copied unchanged
    '.jpg'  : 'image/jpeg',   // for images copied unchanged
    '.svg'  : 'image/svg+xml',
    '.json' : 'application/json',
    '.pdf'  : 'application/pdf',
    '.txt'  : 'text/plain',
    '.ttf'  : 'application/x-font-ttf',
    '.woff' : 'application/font-woff',
    '.aac'  : 'audio/aac',
    '.mp3'  : 'audio/mpeg',
    '.mp4'  : 'video/mp4',
    '.webm' : 'video/webm',
    '.ico'  : 'image/x-icon', // just for favicon.ico
    '.xhtml': undefined,      // not suitable for dual delivery, use .html
    '.htm'  : undefined,      // non-standard, use .html
    '.rar'  : undefined,      // non-standard, platform dependent, use .zip
    '.doc'  : undefined,      // non-standard, platform dependent, use .pdf
    '.docx' : undefined,      // non-standard, platform dependent, use .pdf
    }
}

// Test the server's logic, and make sure there's an index file.
function test() {
    check(removeQuery("/index.html?x=1"), "/index.html");
    check(lower("/index.html"), "/index.html");
    check(lower("/INDEX.HTML"), "/index.html");
    check(addIndex("/index.html"), "/index.html");
    check(addIndex("/admin/"), "/admin/index.html");
    check(valid("/index.html"), true);
    check(valid("../x"), false, "urls must start with /");
    check(valid("/x/../y"), false, "urls must not contain /../");
    check(valid("/x//y"), false, "urls must not contain //");
    check(valid("/x/./y"), false, "urls must not contain /./");
    check(valid("/.txt"), false, "urls must not contain /.");
    check(valid("/x"), false, "filenames must have extensions");
    check(safe("/index.html"), true);
    check(safe("/\n/"), false);
    check(safe("/x y/"), false);
    check(open("/index.html"), true);
    check(open("/server.js"), false);
    check(findType("/x.txt"), "text/plain");
    check(findType("/x"), undefined);
    check(findType("/x.abc"), undefined);
    check(findType("/x.htm"), undefined);
    check(negotiate("xxx,text/html"), "text/html");
    check(negotiate("xxx,application/xhtml+xml"), "application/xhtml+xml");
    check(fs.existsSync('./index.html'), true, "site contains no index.html");
}

function check(x, out, message) {
    if (x == out) return;
    if (message) console.log("Test failed:", message);
    else console.log("Test failed: Expected", out, "Actual:", x);
    console.trace();
    process.exit(1);
}

function pageHead() {
    var html = '<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" lang="en-GB" xml:lang="en-GB"><head>';
    html += '<meta charset="UTF-8"/>';
    html += '<title>Users</title>';
    html += '<link href="resetstyle.css" rel="stylesheet"/>';
    html += '<link href="login.css" rel="stylesheet"/>';
    html += '<link href="postpage.css" rel="stylesheet"/>';
    html += '<link href="navigation.css" rel="stylesheet"/>';
    html += '<link href=\'https://fonts.googleapis.com/css?family=Indie+Flower\' rel=\'stylesheet\'; type=\'text/css\' />';
    html += '<link href="time.css" rel="stylesheet"/>';
    html += '<link href="style.css" rel="stylesheet" type="text/css" />';
    html += '<!--[if lt IE 9]>';
    html += '<script src="dist/html5shiv.js"></script>';
    html += '<![endif]-->';
    html += '</head>';
    html += '<body>';
    html += '<header>';
    html += '<img id="logo" src="images/logo2.png" alt="uPd8" />';
	html += '<section class="login">';
    html += '<form name="login" action="" method="post" accept-charset="utf-8">';
    html += '<ul>';
    html += '<li>';
    html += '<input type="email" name="usermail" placeholder="name@email.com" required="true"/>';
    html += '</li>';
    html += '<li>';
    html += '<input type="password" name="password" placeholder="password" required="true"/>';
    html += '</li>';
    html += '<li>';
    html += '<input type="submit" value="Login"/>';
    html += '</li>';
	html += '<li>';
    html += '<input type="submit" onclick="location.href=\'registrationpage.html\';" value="Register"/>';
    html += '</li>';
    html += '</ul>';
    html += '</form>';
    html += '</section>';
    html += '<h1> Stay uPd8ed </h1>';
    html += '</header>';
    html += '<main id="container">';
    html += '<div id="content">';
    html += '<p class="marquee">';
    html += '<span id="dtText"></span>';
    html += '<script type="text/javascript" src="clock.js"></script>';
    html += '</p>';
    html += '<hr/>';
    html += '<nav>';
    html += '<ul>';
    html += '<li><a href="index.html">Home</a></li>';
    html += '<li><a href="upd8s.html"> uPd8s </a></li>';
    html += '<li><a href="users.html"> Users </a></li>';
    html += '<li><a href="contactpage.html"> Contact </a></li>';
    html += '<li><a href="aboutpage.html"> About </a></li>';
    html += '</ul>';
    html += '</nav>';
    html += '<hr/>';

    return html;
}

function pageFoot(){
    var html = '</div>';
    html += '</main>';
    html += '<footer> <small> © Copyright 2015- 2016, uPd8</small> </footer>';
    html += '</body>';
    html += '</html>';

    return html;
}

function postUpd8Form(){
    var html = '<section class="left"><form id="post-form" method="" action="">';
    html += '<fieldset>';
    html += '<p>';
    html += '<label for="contact">Username (required)</label>';
    html += '<input name="uname" role="input" aria-required="true" value="" placeholder="Name" />';	
    html += '</p>';
    html += '<p>';
    html += '<label for="url">uPd8 URL</label>';
    html += '<input name="url" role="input" aria-required="true" value="" placeholder="Company URL" />';
    html += '</p>';
    html += '<p>';
    html += '<label for="message">Your uPd8!</label>';
    html += '<textarea name="message" cols="22" aria-required="true" placeholder="Please provide details here"></textarea>';
    html += '</p>';
    html += '<p>';
    html += '<input name="submit" id="submitButton" onclick="return validateForm();" type="submit" value="Submit"/>';
    html += '</p>';
    html += '</fieldset>';
    html += '</form>';
    html += '</section>';

    return html;
}
