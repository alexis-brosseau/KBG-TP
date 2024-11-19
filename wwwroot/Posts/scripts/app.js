function loadForm() {

    document.getElementById("form").addEventListener("submit", async function(event) {
        event.preventDefault();

        document.getElementById("datetime").value = Date.now().toString();
        const data = new FormData(event.target);

        let payload = {};
        data.forEach((value, key) => {
            payload[key] = value;
            console.log(key, value);
        });

        const response = await fetch("/api/posts", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: body
        })
        .catch(error => {
            console.error("Failed to create post");
        });

        if (response.ok) {
            window.location = "/api/posts";
            console.log("Post created successfully");
        }
    });
}

async function loadHome() {
    const content = document.getElementById("content");

    let posts = await fetch("/api/posts?all=true")
    .then(response => response.json())
    .catch(error => {
        console.error("Failed to load posts");
    });

    posts.forEach(post => {
        console.log(post);
        const div = document.createElement("div");
        div.innerHTML = `
            <img src="${post.Image}" alt="${post.Title}" />
            <div class="info">
                <h2>${post.Title}</h2>
                <span>${post.Text}</span>
                <span>${post.Category}</span>
                <span>${post.Creation}</span>
            </div>
        `;

        div.id = `post-${post.Id}`;
        div.className = "post";

        content.appendChild(div);
    });
}