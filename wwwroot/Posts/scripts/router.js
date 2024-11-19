const routes = { 
    '404': {
        title: '404 - Not Found',
        path: '/posts/pages/404.html',
        onload: () => {}
    },
    '/api/posts': {
        title: 'Posts',
        path: '/posts/pages/home.html',
        onload: () => {
            loadHome();
        }
    },
    '/api/posts/create': {
        title: 'Create Post',
        path: '/posts/pages/form.html',
        onload: () => {
            loadForm();
            initImageUploaders();
        }
    }
};

function route(event) {
    event.preventDefault();
    window.history.pushState({}, '', event.target.href);
    handleLocation();
}

async function handleLocation() {
    const path = window.location.pathname;
    const route = routes[path] || routes['404'];
    const html = await fetch(route.path).then(response => response.text());
    
    window.title = route.title;
    document.getElementById("page").innerHTML = html;
    route.onload();
}

window.onpopstate = handleLocation;
window.route = route;
handleLocation();