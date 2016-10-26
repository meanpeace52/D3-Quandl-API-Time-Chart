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
    
    app.route('/api/posts/search/:field/:value').all(postsPolicy.isAllowed)
        .get(posts.list);
    app.param('field', posts.list);
    app.param('value', posts.list);
        
    // Single post routes
    app.route('/api/posts/:postId').all(postsPolicy.isAllowed)
        .get(posts.read)
        .put(posts.update)
        .delete(posts.delete);

    app.route('/api/trackpostview/:postId').all(postsPolicy.isAllowed)
        .post(posts.trackPostView);

    app.route('/api/purchasepost/:postId').all(postsPolicy.isAllowed)
        .post(posts.purchasePost);
        
    // Finish by binding the post middleware
    app.param('postId', posts.postByID);
};
