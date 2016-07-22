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
                    resources: '/api/models/user/:userId',
                    permissions: ['get']
                }
            ]
        },
        {
            roles: ['user'],
            allows: [
                {
                    resources: '/api/models',
                    permissions: ['post']
                },
                {
                    resources: '/api/models/:modelId',
                    permissions: ['get', 'put', 'delete']
                },
                {
                    resources: '/api/models/user/:userId',
                    permissions: ['get']
                }
            ]
        },
        {
            roles: ['guest'],
            allows: [
                {
                    resources: '/api/models',
                    permissions: ['get']
                },
                {
                    resources: '/api/models/:modelId',
                    permissions: ['get']
                },
                {
                    resources: '/api/models/user/:userId',
                    permissions: ['get']
                }
            ]
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
