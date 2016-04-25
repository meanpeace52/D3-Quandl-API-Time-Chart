'use strict';

ApplicationConfiguration.registerModule('admin', ['core']);

ApplicationConfiguration.registerModule('admin.artists', ['core.admin']);
ApplicationConfiguration.registerModule('admin.artists.routes', ['core.admin.routes']);

ApplicationConfiguration.registerModule('admin.paintings', ['core.admin']);
ApplicationConfiguration.registerModule('admin.paintings.routes', ['core.admin.routes']);

ApplicationConfiguration.registerModule('admin.users', ['core.admin']);
ApplicationConfiguration.registerModule('admin.users.routes', ['core.admin.routes']);
