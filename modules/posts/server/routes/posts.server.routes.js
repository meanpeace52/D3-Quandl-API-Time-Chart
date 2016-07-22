'use strict';

/**
 * Module dependencies.
 */
var postsPolicy = require('../policies/posts.server.policy'),
    posts = require('../controllers/posts.server.controller');

module.exports = function (app) {
    // posts collection routes
    app.route('/api/posts').all(postsPolicy.isAllowed)
        .get(posts.list)
        .post(posts.create);
        
    app.route('/api/posts/subject/:subject').all(postsPolicy.isAllowed)
        .get(posts.list);
        
    app.param('subject', posts.list);
        
    // Single post routes
    app.route('/api/posts/:postId').all(postsPolicy.isAllowed)
        .get(posts.read)
        .put(posts.update)
        .delete(posts.delete);

    // Finish by binding the post middleware
    app.param('postId', posts.postByID);
};
