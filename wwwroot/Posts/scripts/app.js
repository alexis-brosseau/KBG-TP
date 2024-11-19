function loadForm() {

    document.getElementById("post-form").addEventListener("submit", async function(event) {
        event.preventDefault();
        
        console.log("Form submitted");
        document.getElementById("datetime").value = Date.now().toString();
        const data = new FormData(event.target);
        data.append("Creation", Date.now().toString());

        const response = await fetch("/api/posts", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams(data).toString()
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
    const postsPanel = document.getElementById("postsPanel");

    let posts = await fetch("/api/posts?all=true")
    .then(response => response.json())
    .catch(error => {
        console.error("Failed to load posts - " + error);
    });

    posts.forEach(post => {
        const div = document.createElement("div");
        const unix = post.Creation;
        const date = new Date(unix);
        // format date in french like: Mardi, 12 Janvier 2021 - 17:44:28 with the frist letter in capital
        const formattedDate = date.toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "numeric", second: "numeric" });
        const stringDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

        div.innerHTML = `
            <div class="header">
                <div class="category">${post.Category}</div>
            </div>
            <div class="body">
                <img src="${post.Image}" alt="${post.Title}" />
                <div class="content">
                    <span class="date">${stringDate}</span>
                    <span class="title">${post.Title}</span>
                    <div class="text">${post.Text}</div>
                </div>
            </div>
        `;

        div.id = `${post.Id}`;
        div.className = "post no-select";

        postsPanel.appendChild(div);
    });
}