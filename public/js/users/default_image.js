
function makeDefaultUserImg(str) {
    const imgArea = document.getElementById("user_img_area");
    let seed = new Number();
    for (char of str) {
        seed = seed + Math.imul(23434513 ^ char.charCodeAt(), 56223435);
    }
    let randomColor = '#' + (0x1000000 | (Math.sin(seed)*0xFFFFFF)).toString(16).substring(1,7);
    let canvas = document.createElement("canvas");
    let context =  canvas.getContext("2d");
    canvas.width = canvas.height = 50;
    context.fillStyle = randomColor;
    context.beginPath();
    context.ellipse(
        canvas.width/2, canvas.height/2,
        canvas.width/2, canvas.height/2,
        0,
        0, Math.PI * 2
    );
    context.fill();
    
    context.font = "600" + " " + (canvas.height/1.5) + "px Arial";
    context.fillStyle = "#ffffff";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(str[0].toUpperCase(), canvas.width/2, canvas.height/2);

    let img = document.createElement("img");
    img.src = canvas.toDataURL();
    imgArea.prepend(img);
}
if(!document.getElementById("user_img")) {
    makeDefaultUserImg(document.getElementById("username").innerText);
}