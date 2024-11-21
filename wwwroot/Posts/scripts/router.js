const routes = { 
    '404': {
        title: 'Posts - 404',
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
        title: 'Posts - Créer',
        path: '/posts/pages/form.html',
        onload: () => {
            loadForm();
            initImageUploaders();
        }
    },
};

const internalRoutes = {
    '/api/posts/edit': {
        title: 'Posts - Modifier',
        path: '/posts/pages/form.html',
        onload: async (data) => {
            const id = data['id'] || null;
            await loadForm(id);
            initImageUploaders();
        }
    },
    '/api/posts/read': {
        title: 'Posts - Lire',
        path: '/posts/pages/read.html',
        onload: async (data) => {
            const id = data['id'] || null;
            await loadPost(id);
        }
    },
};

function route(event) {
    event.preventDefault();
    currentData = null;
    window.history.pushState({}, '', event.currentTarget.href);
    handleLocation();
}

async function handleLocation() {

    localStorage.removeItem("href");
    localStorage.removeItem("data");

    const path = window.location.pathname;
    const route = routes[path] || routes['404'];
    const html = await fetch(route.path).then(response => response.text());
    
    document.title = route.title;
    document.getElementById("page").innerHTML = html;
    route.onload();
}

function routeInternal(event) {
    event.preventDefault();
    const href = event.currentTarget.href;
    const data = event.currentTarget.dataset;
    
    currentData = data;
    window.history.pushState({}, '', event.currentTarget.href);
    handleInternal(href, data);
}

async function handleInternal(href, data) {

    localStorage.setItem("href", JSON.stringify(href));
    localStorage.setItem("data", JSON.stringify(data));

    const path = new URL(href);
    const route = internalRoutes[path.pathname] || routes['404'];
    const html = await fetch(route.path).then(response => response.text());
    
    document.title = route.title;
    document.getElementById("page").innerHTML = html;
    route.onload(data);
}

function init() {
    window.onpopstate = handleLocation;
    window.route = route;

    const href = window.location.href;
    const lastHref = JSON.parse(localStorage.getItem("href"));
    const lastData = JSON.parse(localStorage.getItem("data"));
    
    if (lastHref != null && lastHref == href) {
        handleInternal(lastHref, lastData);
    }
    else {
        handleLocation();
    };
}

init();