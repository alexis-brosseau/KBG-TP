async function loadForm(id = null) {

    const form = document.getElementById("post-form");

    // Si id == null, on crée un nouveau post
    if (id == null) {
        form.addEventListener("submit", async function(event) {
            event.preventDefault();
            
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

            if (!response.ok) {
                console.log("Failed to create post");
            }
            window.location = "/api/posts";
        });
    }
    else {
        const request = fetch(`/api/posts?id=${id}`, { method: "GET" })
        
        const title = form.querySelector("#form-title");
        const text = form.querySelector("#form-text");
        const category = form.querySelector("#form-category");
        const image = form.querySelector("#form-image");
        const submit = form.querySelector("#form-submit");

        const posts = await request.then(response => response.json());
        const post = posts[0] || null;
        if (post == null) {
            console.error("Failed to load post");
            return;
        }
        
        title.value = post.Title;
        text.value = post.Text;
        category.value = post.Category;
        image.setAttribute("imageSrc", post.Image);
        image.setAttribute("newImage", "false");
        submit.value = "Modifier";

        form.addEventListener("submit", async function(event) {
            event.preventDefault();
            
            const data = new FormData(event.target);
            data.append("Creation", Date.now().toString());

            const response = await fetch(`/api/posts/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams(data).toString()
            })

            if (!response.ok) {
                console.log("Failed to update post");
            }
            window.location = "/api/posts";
        });
    }
}

async function loadHome() {
    const search = document.getElementById("search");
    const searchButton = document.getElementById("searchButton");
    const scrollPanel = document.getElementById("scrollPanel");
    const postsPanel = document.getElementById("postsPanel");
    const itemLayout = {
        width: $("#sample").outerWidth(),
        height: $("#sample").outerHeight()
    };
    $("#sample").remove();

    const pageManger = new PageManager('scrollPanel', 'postsPanel', itemLayout, async (queryString) => {
        
        let keywords = (search.value != "") ? search.value.split(" ") : [];

        let posts = [];
        queryString = queryString == "" ? "?" : queryString;
        
        let url = `/api/posts?sort=Creation,desc`
        if (keywords.length > 0) {
            url += `&keywords=${keywords.join(",")}`;
        }
        url += queryString;

        await $.ajax({
            url: url,
            method: "GET",
            success: function (data) {
                posts = data;
            },
            error: function (error) {
                console.error("Failed to load posts - " + error);
            }
        });

        if (posts.length === 0) {
            return true;
        }
    
        posts.forEach(post => {
            const div = document.createElement("div");
            const unix = post.Creation;
            const date = new Date(unix);
            const formattedDate = date.toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "numeric", second: "numeric" });
            const stringDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    
            div.innerHTML = `
                <div class="header">
                    <div class="category">${post.Category}</div>
                    <div class="btn_cntr">
                        <a class="edit btn no-link" data-id="${post.Id}" href="/api/posts/edit" onclick="routeInternal(event)">
                            <span class="material-symbols-rounded">
                                edit
                            </span>
                        </a>
                        <span class="remove btn">
                            <span class="material-symbols-rounded">
                                delete
                            </span>
                        </span>
                    </div>
                </div>
                <a class="no-link body" data-id="${post.Id}" href="/api/posts/read" onclick="routeInternal(event)">
                    <img src="${post.Image}" alt="${post.Title}" />
                    <div class="content">
                        <span class="date">${stringDate}</span>
                        <span class="title">${post.Title}</span>
                        <div class="text">${post.Text}</div>
                    </div>
                </a>
            `;
    
            div.id = `${post.Id}`;
            div.className = "post no-select";
    
            postsPanel.appendChild(div);

            div.querySelector(".remove").addEventListener("click", async function() {
                if (!confirm("Voulez vous vraiment supprimer ce post ?")) {
                    return;
                }
                
                const response = await fetch(`/api/posts/${post.Id}`, {
                    method: "DELETE"
                })
                .catch(error => {
                    console.error("Failed to delete post");
                });
    
                if (response.ok) {
                    pageManger.reset();
                }
            });
        });

        return false;
    });

    search.addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
            pageManger.reset();
        }
    });

    searchButton.addEventListener("click", function() {
        pageManger.reset();
    });

    setInterval(async () => {
        let etag = null;
        await $.ajax({
            url: "/api/posts",
            method: "HEAD",
            success: function(data, status, xhr) {
                etag = xhr.getResponseHeader("ETag");
            },
            error: function(error) {
                console.error("Failed to get etag - " + error);
            }
        });
        
        let lastEtag = localStorage.getItem("etag");
        if (lastEtag !== etag) {
            localStorage.removeItem("etag");
            localStorage.setItem("etag", etag);
            pageManger.reset();
        }
    }, 2000);
}

async function loadPost(id) {
    if (id == null) {
        console.error("Failed to load post");
        return;
    }

    const request = fetch(`/api/posts?id=${id}`, { method: "GET" });

    const title = document.getElementById("post-title");
    const text = document.getElementById("post-text");
    const category = document.getElementById("post-category");
    const image = document.getElementById("post-image");
    const date = document.getElementById("post-date");

    const posts = await request.then(response => response.json());
    const post = posts[0] || null;

    if (post == null) {
        console.error("Failed to load post");
        return;
    }

    title.innerText = post.Title;
    text.innerText = post.Text;
    category.innerText = post.Category;
    image.src = post.Image;
    date.innerText = new Date(post.Creation).toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "numeric", second: "numeric" });
    date.innerText = date.innerText.charAt(0).toUpperCase() + date.innerText.slice(1);
}