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
    const search = document.getElementById("search");
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
                    <div>
                        <span class="remove btn" data-id="${post.Id}">Retirer</span>
                    </div>
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

            div.querySelector(".remove").addEventListener("click", async function() {
                if (!confirm("Voulez vous vraiment supprimer ce post ?")) {
                    console.log("Post deletion cancelled");
                    return;
                }
                
                const id = $(this).data("id");
                const response = await fetch(`/api/posts/${id}`, {
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
}