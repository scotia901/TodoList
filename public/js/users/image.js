window.onload = async (event) => {
    event.preventDefault();
    if(!document.getElementsByClassName('has-image-file')[0]) {
        const nickname = document.getElementById('nickname').innerText;
        await makeDefaultUserImg(nickname);
    }
}

async function makeDefaultUserImg(nickname) {
    const imgArea = document.getElementById('user-img-area');
    imgArea.classList.add('has-image-file');
    const img = document.createElement('img');
    const canvas = document.createElement('canvas');
    const context =  canvas.getContext('2d');
    let seed = new Number();
    for (char of nickname) {
        seed = seed + Math.imul(23434513 ^ char.charCodeAt(), 56223435);
    }
    const randomColor = '#' + (0x1000000 | (Math.sin(seed)*0xFFFFFF)).toString(16).substring(1,7);
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
    
    context.font = '400' + ' ' + (canvas.height/2) + 'px Arial';
    context.fillStyle = '#ffffff';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(nickname[0].toUpperCase(), canvas.width/2, canvas.height/2);

    
    img.src = canvas.toDataURL();
    imgArea.prepend(img);
}

function uploadImg() {
    document.getElementById('upload-img').click();
}

async function toDefaultImg() {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            location.reload();
        } else if (this.readyState == 4 && this.status == 400) {
            alert(ERROR-DEL-IMG-MSG);
        }
    }
    xhr.open('delete', '/users/profile/img', true);
    xhr.send();
}

async function uploadFile() {
    let file = this.files[0]; 
    let img = new Image();
    img.src = URL.createObjectURL(file);

    if(this.files) {
        await img.decode();
        const imageWidth = 50;
        const imageHeight = 50;
        let canvas = document.createElement('canvas');
        let context =  canvas.getContext('2d');

        context.drawImage(img, 0, 0);
        canvas.width = imageWidth;
        canvas.height = imageHeight;

        context.save();
        context.beginPath();
        context.arc(25, 25, 25, 0, Math.PI * 2, true);
        context.closePath();
        context.clip();
        context.drawImage(img, 0, 0, imageWidth, imageHeight);

        canvas.toBlob((blob) => {
            const formData = new FormData();
            formData.append('uploaded-file', blob, 'user-img.jpeg');
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    location.reload();
                } else if (this.readyState == 4 && this.status == 400) {
                    alert(ERROR-UPLOAD-IMG-MSG);
                }
            }
            xhr.open('post', '/users/profile/img', true);
            xhr.send(formData);
        });
    }
}