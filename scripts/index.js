function showResponsive() {
    var x = document.getElementById("nav");
    if (x.className === "nav clearfix") {
        x.className += " responsive";
    } else {
        x.className = "nav clearfix";
    }
}