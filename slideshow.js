var slides = [
    'Images/index-gallery.svg',
    'Images/index-brush.svg',
    'Images/index-camera.svg'];

var current=0;
var duration=5000;

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
