window.onload = async (event) => {
    event.preventDefault();
    const uploadImg = document.getElementById('upload-img');
    const uploadImgBtn = document.getElementById('upload-profile-image-btn');
    const deleteImgBtn = document.getElementById('delete-profile-image-btn');
    
    if(uploadImg) uploadImg.addEventListener('change', uploadFile);
    if(uploadImgBtn) uploadImgBtn.addEventListener('click', uploadProfileImg);
    if(deleteImgBtn) deleteImgBtn.addEventListener('click', deleteProfileImg);

    if(!document.getElementsByClassName('profile-image has-image-file')[0]) await createDefaultProfileImg();
}

async function createDefaultProfileImg() {
    const nickname = document.getElementById('nickname').innerText;
    const img = document.getElementsByClassName('profile-image')[0];
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
    context.fillText(nickname[0].toUpperCase(), canvas.width/2, canvas.height/2 + 2);

    img.classList.remove('has-image-file');
    img.src = canvas.toDataURL();
}

function uploadProfileImg() {
    document.getElementById('upload-img').click();
}

async function deleteProfileImg() {
    const comfrim = confirm('정말로 프로필 이미지를 삭제 하시겠습니까?');

    if(comfrim == true) {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = async function() {
            if (this.readyState == 4 && this.status == 200) {
                await createDefaultProfileImg();
            } else if (this.readyState == 4 && this.status == 400) {
                alert(ERROR-DEL-IMG-MSG);
            }
        }
        xhr.open('delete', '/users/profile/img', true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.send();
    }
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
                    const profileImg = document.getElementsByClassName('profile-image')[0];
                    profileImg.classList.add('has-image-file');
                    profileImg.src = '/data/uploads/img/profile/' + this.responseText;
                } else if (this.readyState == 4 && this.status == 500) {
                    alert(ERROR_UPLOAD_IMG_MSG);
                }
            }
            xhr.open('post', '/users/profile/img', true);
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.send(formData);
        });
    }
}