'use strict';

var defaultEnvConfig = require('./default');

module.exports = {
  port: process.env.PORT || 3001,
  db: {
    uri: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://administrator:password@54.84.240.194/datasets',
    //uri: 'mongodb://localhost:27017/theory-lab',
    options: {
      user: '',
      pass: ''
    },
    // Enable mongoose debug mode
    debug: process.env.MONGODB_DEBUG || false
  },
  log: {
    // logging with Morgan - https://github.com/expressjs/morgan
    // Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
    format: 'dev',
    options: {
      // Stream defaults to process.stdout
      // Uncomment/comment to toggle the logging to a log on the file system
      //stream: {
      //  directoryPath: process.cwd(),
      //  fileName: 'access.log',
      //  rotatingLogs: { // for more info on rotating logs - https://github.com/holidayextras/file-stream-rotator#usage
      //    active: false, // activate to use rotating logs
      //    fileName: 'access-%DATE%.log', // if rotating logs are active, this fileName setting will be used
      //    frequency: 'daily',
      //    verbose: false
      //  }
      //}
    }
  },
  app: {
    title: defaultEnvConfig.app.title + ' - Development Environment'
  },
  facebook: {
    clientID: process.env.FACEBOOK_ID || 'APP_ID',
    clientSecret: process.env.FACEBOOK_SECRET || 'APP_SECRET',
    callbackURL: '/api/auth/facebook/callback'
  },
  twitter: {
    clientID: process.env.TWITTER_KEY || 'NJpP4gKsYlQEDzbaGBoMEgovJ',
    clientSecret: process.env.TWITTER_SECRET || 'BUz9Wt83CbTSTZl645pl6u8v1G1CqjYLmmEp0878TT5TnQgn5Y',
    callbackURL: '/api/auth/twitter/callback'
  },
  google: {
    clientID: process.env.GOOGLE_ID || 'APP_ID',
    clientSecret: process.env.GOOGLE_SECRET || 'APP_SECRET',
    callbackURL: '/api/auth/google/callback'
  },
  linkedin: {
    clientID: process.env.LINKEDIN_ID || 'APP_ID',
    clientSecret: process.env.LINKEDIN_SECRET || 'APP_SECRET',
    callbackURL: '/api/auth/linkedin/callback'
  },
  github: {
    clientID: process.env.GITHUB_ID || 'APP_ID',
    clientSecret: process.env.GITHUB_SECRET || 'APP_SECRET',
    callbackURL: '/api/auth/github/callback'
  },
  paypal: {
    clientID: process.env.PAYPAL_ID || 'CLIENT_ID',
    clientSecret: process.env.PAYPAL_SECRET || 'CLIENT_SECRET',
    callbackURL: '/api/auth/paypal/callback',
    sandbox: true
  },
  mailer: {
    from: process.env.MAILER_FROM || 'theorylab@humanific.com',
    options: {
      transport: process.env.MAILER_TRANSPORT || 'ses',
      accessKeyId: process.env.AWS_KEY_ID || 'AKIAJJFR7HFHM2ETEVCQ',
      secretAccessKey: process.env.AWS_SECRET || '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',
      SeviceUrl:process.env.AWS_SES_SERVICEURL || 'https://email.us-east-1.amazonaws.com',
      rateLimit:process.env.AWS_SES_RATELIMIT || 14
    }
  },
  stripe:{
    secret_key: process.env.STRIPE_SECRET || 'sk_test_HhURh1PDuU8KuJLk8ASmcjtU',
    publishable_key: process.env.STRIPE_PUBLIC || 'pk_test_5gsED75zyGfKF9TlVIXo4adn',
  },
  stripePlans:[
        {name:'Premium', price:10,id:'premium',stripe_id:'premium_monthly', period:1},
        {name:'Small Business', price:60,id:'small_business',stripe_id:'small_business_monthly', period:1},
        {name:'Enterprise', price:200,id:'enterprise', stripe_id:'enterprise_monthly', period:1},
        {name:'Premium', price:50,id:'premium',stripe_id:'premium6', period:6},
        {name:'Small Business', price:290,id:'small_business',stripe_id:'small_business6', period:6},
        {name:'Enterprise', price:950,id:'enterprise', stripe_id:'enterprise6', period:6},
        {name:'Premium', price:80,id:'premium',stripe_id:'premium_yearly', period:12},
        {name:'Small Business', price:450,id:'small_business',stripe_id:'small_business_yearly', period:12},
        {name:'Enterprise', price:1400,id:'enterprise', stripe_id:'enterprise_yearly', period:12}],
  livereload: true,
  seedDB: {
    seed: process.env.MONGO_SEED === 'true' ? true : false,
    options: {
      logResults: process.env.MONGO_SEED_LOG_RESULTS === 'false' ? false : true,
      seedUser: {
        username: process.env.MONGO_SEED_USER_USERNAME || 'user',
        provider: 'local',
        email: process.env.MONGO_SEED_USER_EMAIL || 'user@localhost.com',
        firstName: 'User',
        lastName: 'Local',
        displayName: 'User Local',
        roles: ['user']
      },
      seedAdmin: {
        username: process.env.MONGO_SEED_ADMIN_USERNAME || 'admin',
        provider: 'local',
        email: process.env.MONGO_SEED_ADMIN_EMAIL || 'admin@localhost.com',
        firstName: 'Admin',
        lastName: 'Local',
        displayName: 'Admin Local',
        roles: ['user', 'admin']
      }
    }
  }
};
