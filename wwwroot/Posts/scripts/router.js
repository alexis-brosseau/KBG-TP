const routes = { 
    '404': '/posts/pages/404.html',
    '/api/posts': '/posts/pages/home.html',
};

function route(event) {
    event.preventDefault();
    window.history.pushState({}, '', event.target.href);
}

async function handleLocation() {
    const path = window.location.pathname;
    const route = routes[path] || routes['404'];
    const html = await fetch(route).then(response => response.text());
    document.getElementById("page").innerHTML = html;
}

window.onpopstate = handleLocation;
window.route = route;
handleLocation();