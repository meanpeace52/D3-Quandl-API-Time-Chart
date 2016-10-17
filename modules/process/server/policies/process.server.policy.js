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
            roles: ['admin', 'user'],
            allows: [
                {
                    resources: '/api/process',
                    permissions: ['get', 'post']
                },
                {
                    resources: '/api/process/:processId',
                    permissions: ['get', 'put', 'delete']
                },
                {
                    resources: '/api/process/user/:userId',
                    permissions: ['get']
                }
            ]
        },
        {
            roles: ['user'],
            allows: [
                {
                    resources: '/api/process',
                    permissions: ['post']
                },
                {
                    resources: '/api/process/:processId',
                    permissions: ['get', 'put', 'delete']
                },
                {
                    resources: '/api/process/user/:userId',
                    permissions: ['get']
                },
                {
                    resources: '/api/deployr/run',
                    permissions: ['post']
                }
            ]
        },
        {
            roles: ['guest'],
            allows: [
                {
                    resources: '/api/process',
                    permissions: ['get']
                },
                {
                    resources: '/api/process/:processId',
                    permissions: ['get']
                },
                {
                    resources: '/api/process/user/:userId',
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

    // If a process is being processed and the current user created it then allow any manipulation
    // TODO: allow admin to manipulate other user's processes
    if (req.body.process && req.user && req.body.process.user && req.body.process.user === req.user._id) {
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
