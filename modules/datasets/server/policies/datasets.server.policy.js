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
                    resources: '/api/datasets',
                    permissions: '*'
                },
                {
                    resources: '/api/datasets/insert',
                    permissions: ['post']
                },
                {
                    resources: '/api/datasets/:datasetId',
                    permissions: '*'
                },
                {
                    resources: '/api/datasets/search',
                    permissions: ['*']
                },
                {
                    resources: '/api/datasets/user/:username',
                    permissions: ['*']
                },
                {
                    resources: '/api/datasets/:datasetId/withs3',
                    permissions: ['*']
                },
                {
                    resources: '/api/datasets/saveCustom',
                    permissions: ['post']
                },
                {
                    resources: '/api/datasets/merge',
                    permissions: ['post']
                },
                {
                    resources: '/api/datasets/purchasedataset/:id',
                    permissions: ['post']
                },
                {
                    resources: '/api/datasets/json2csvinsert',
                    permissions: ['post']
                }
            ]
        },
        {
            roles: ['user'],
            allows: [
                {
                    resources: '/api/datasets',
                    permissions: ['get', 'post']
                },
                {
                    resources: '/api/datasets/insert',
                    permissions: ['post']
                },
                {
                    resources: '/api/datasets/:datasetId',
                    permissions: ['get']
                },
                {
                    resources: '/api/datasets/search',
                    permissions: ['get']
                },
                {
                    resources: '/api/datasets/user/:username',
                    permissions: ['get']
                },
                {
                    resources: '/api/datasets/:datasetId/withs3',
                    permissions: ['get']
                },
                {
                    resources: '/api/datasets/saveCustom',
                    permissions: ['post']
                },
                {
                    resources: '/api/datasets/merge',
                    permissions: ['post']
                },
                {
                    resources: '/api/datasets/purchasedataset/:id',
                    permissions: ['post']
                },
                {
                    resources: '/api/datasets/json2csvinsert',
                    permissions: ['post']
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

    // If an post is being processed and the current user created it then allow any manipulation
    if (req.dataset && req.user && req.dataset.user && req.dataset.user.id === req.user.id) {
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
