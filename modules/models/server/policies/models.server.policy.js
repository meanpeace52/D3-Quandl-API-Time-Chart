'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke datasets Permissions
 */
exports.invokeRolesPolicies = function () {
    acl.allow([
        {
            roles: ['admin'],
            allows: [
                {
                    resources: '/api/models',
                    permissions: ['get', 'post']
                },
                {
                    resources: '/api/models/:modelId',
                    permissions: ['get', 'put', 'delete']
                },
                {
                    resources: '/api/models/user/:id',
                    permissions: ['get']
                },
                {
                    resources: '/api/models/search',
                    permissions: ['get']
                },
                {
                    resources: '/api/models/purchasemodel/:id',
                    permissions: ['post']
                },
                {
                    resources: '/api/models/copy',
                    permissions: ['post']
                },
                {
                    resources: '/api/models/validate-title',
                    permissions: ['post']
                },
                {
                    resources: '/api/models/dataset/:id',
                    permissions: ['get']
                }
            ]
        },
        {
            roles: ['user'],
            allows: [
                {
                    resources: '/api/models',
                    permissions: ['get','post']
                },
                {
                    resources: '/api/models/:modelId',
                    permissions: ['get', 'put', 'delete']
                },
                {
                    resources: '/api/models/user/:id',
                    permissions: ['get']
                },
                {
                    resources: '/api/models/search',
                    permissions: ['get']
                },
                {
                    resources: '/api/models/purchasemodel/:id',
                    permissions: ['post']
                },
                {
                    resources: '/api/models/copy',
                    permissions: ['post']
                },
                {
                    resources: '/api/models/dataset/:id',
                    permissions: ['get']
                },
                {
                    resources: '/api/models/validate-title',
                    permissions: ['post']
                }
            ]
        },
        {
            roles: ['guest'],
            allows: []
        }
    ]);
};

/**
 * Check If datasets Policy Allows
 */
exports.isAllowed = function (req, res, next) {
    var roles = (req.user) ? req.user.roles : ['guest'];

    // If a model is being processed and the current user created it then allow any manipulation
    // TODO: allow admin to manipulate other user's models
    if (req.body.model && req.user && req.body.model.user && req.body.model.user === req.user._id) {
        return next();
    }
    
    // Check for user roles
    acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
        if (err) {
            // An authorization error occurred.
            return res.status(500).send('Unexpected authorization error');
        } else {
            if (isAllowed) {
                // Access granted! Invoke next middleware
                return next();
            } else {
                return res.status(403).json({
                    message: 'User is not authorized'
                });
            }
        }
    });
};
