
document.getElementById("projectForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("animalName").value;
    const situation = document.getElementById("situation").value;
    const goalAmount = document.getElementById("goalAmount").value;
    const ownerAmount = document.getElementById("ownerAmount").value;
    const kakaoLink = document.getElementById("kakaoLink").value;
    const imageInput = document.getElementById("image");
    const imageFile = imageInput.files[0];

    if (!imageFile) {
        alert("대표 이미지를 선택해주세요.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        const imageUrl = event.target.result;

        const newProject = {
            id: "paw_" + new Date().getTime(),
            name,
            situation,
            goalAmount,
            ownerAmount,
            kakaoLink,
            image: imageUrl
        };

        const existingProjects = JSON.parse(localStorage.getItem("projects") || "[]");
        existingProjects.unshift(newProject);
        localStorage.setItem("projects", JSON.stringify(existingProjects));

        alert("프로젝트가 성공적으로 등록되었습니다!");
        window.location.href = "index.html";
    };
    reader.readAsDataURL(imageFile);
});
