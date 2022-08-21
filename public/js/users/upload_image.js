function uploadImg() {
    document.getElementById("upload_img").click();
}

function toDefaultImg() {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            location.reload();
        } else if (this.readyState == 4 && this.status == 400) {
            alert("회원 이미지 삭제에 실패 하였습니다.");
        }
    }
    xhr.open("delete", "/users/profile/img", true);
    xhr.send();
}

document.getElementById("upload_img").onchange = async function () {
    let file = this.files[0]; 
    let img = new Image();
    img.src = URL.createObjectURL(file);

    let reader = new FileReader();

    reader.onload = function(e) {

    }

    if(this.files) {
        await img.decode();
        const IMG_WIDTH = 50;
        const IMG_HEIGHT = 50;
        let canvas = document.createElement("canvas");
        let context =  canvas.getContext("2d");

        console.log(this.files[0]);
        context.drawImage(img, 0, 0);
        canvas.width = IMG_WIDTH;
        canvas.height = IMG_WIDTH;

        context.save();
        context.beginPath();
        context.arc(25, 25, 25, 0, Math.PI * 2, true);
        context.closePath();
        context.clip();
        context.drawImage(img, 0, 0, IMG_WIDTH, IMG_WIDTH);

        canvas.toBlob((blob) => {
            const formData = new FormData();
            formData.append('uploaded_file', blob, 'user_img.jpeg');
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    location.reload();
                } else if (this.readyState == 4 && this.status == 400) {
                    alert("알수 없는 오류로 인하여 업로드 실패했습니다.");
                }
            }
            xhr.open("post", "/users/profile", true);
            xhr.send(formData);
        });
}}