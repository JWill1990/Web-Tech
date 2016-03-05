var slides = [
    'Images/car1.gif',
    'Images/car2.gif',
    'Images/car3.gif',];

var current=0;
var duration=3000;

function slideShow() {
    document.getElementById('slide').className += "fadeOut";
    setTimeout(function() {
        document.getElementById('slide').src = slides[current];
        document.getElementById('slide').className = "";
    },1000);
    current++;
    if (current == slides.length) { current = 0; }
    setTimeout(slideShow, duration);
}
slideShow();
