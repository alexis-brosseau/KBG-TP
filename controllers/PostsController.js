
import Controller from './Controller.js';
import PostModel from '../models/post.js';
import Repository from '../models/repository.js';
import fs from 'fs';

export default class PostsController extends Controller {
    constructor(HttpContext) {
        super(HttpContext, new Repository(new PostModel()));
        this.params = HttpContext.path.params;
    }

    get() {
        if (this.HttpContext.path.queryString) {
            super.get();
            return;
        }

        let content = fs.readFileSync("./wwwroot/Posts/index.html");
        this.HttpContext.response.content("text/html", content);
    }
}