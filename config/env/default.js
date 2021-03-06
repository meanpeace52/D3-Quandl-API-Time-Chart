'use strict';

module.exports = {
  app: {
    title: 'Theory Lab',
    description: '',
    keywords: 'mongodb, express, angularjs, node.js, mongoose, passport',
    googleAnalyticsTrackingID: process.env.GOOGLE_ANALYTICS_TRACKING_ID || 'GOOGLE_ANALYTICS_TRACKING_ID'
  },
  s3AccessKeyId: 'AKIAI356G25CALROLSGA',
  s3SecretAccessKey: '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',
  deployrHost: 'http://52.44.200.161:8000/deployr/',
  deployrUsername: 'testuser',
  deployrPassword: '8sBLAJkqJh4G6VhY',
  quandlApiKey: 'ZLbtxbexUUMvs4GCAa-m',
  repubhubRssUrl: 'http://feeds.icopyright.net/rssFeeds/dbd10618cd452b3a2e7752829d0a1cd1fafca89b.rss',
  port: process.env.PORT || 3000,
  templateEngine: 'swig',
  // Session Cookie settings
  sessionCookie: {
    // session expiration is set by default to 24 hours
    maxAge: 24 * (60 * 60 * 1000),
    // httpOnly flag makes sure the cookie is only accessed
    // through the HTTP protocol and not JS/browser
    httpOnly: true,
    // secure cookie should be turned to true to provide additional
    // layer of security so that the cookie is set only when working
    // in HTTPS mode.
    secure: false
  },
  // sessionSecret should be changed for security measures and concerns
  sessionSecret: process.env.SESSION_SECRET || 'Ao3KR6b6zuzvcpDZ6g1HamfZUW09qM4CwKmtgbuxyhwhSZtBw68Yi9i8jN/v+MSaOP+ujSHQSbW40IWk4pi7E4PeAqB1B1yLYdTl',
  // sessionKey is set to the generic sessionId key used by PHP applications
  // for obsecurity reasons
  sessionKey: 'sessionId',
  sessionCollection: 'sessions',
  slack_hook_url: '',
  logo: 'modules/core/client/img/brand/logo.png',
  favicon: 'modules/core/client/img/brand/favicon.ico',
  uploads: {
    profileUpload: {
      dest: './modules/users/client/img/profile/uploads/', // Profile upload destination path
      limits: {
        fileSize: 5*1024*1024 // Max file size in bytes (1 MB)
      }
    },
    stripeUpload: {
      dest: './temp/', // files for stripe identity verification
      limits: {
        fileSize: 4*1024*1024 // Max file size in bytes (4 MB)
      }
    }
  },
  applicationFee:20 //Stripe application_fee in %
};
