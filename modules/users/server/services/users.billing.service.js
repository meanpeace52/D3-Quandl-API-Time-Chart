'use strict';


var path = require('path'),
    config = require(path.resolve('./config/config')),
    stripe = require('stripe')(config.stripe.secret_key),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

var plans = config.stripePlans;


   function purchaseItem (item, type, token, user, next){
     if (!item.user.stripeAccount) return next({message:'The item seller has no stripe account'});
     if (!item.user.stripeChargesEnabled) return next({message:'The item seller is not able to charge'});
     var charge = {
       amount: item.cost * 100,
       currency: 'usd',
       destination : item.user.stripeAccount,
       application_fee : item.cost * 100 * (config.applicationFee / 100),
       description: 'purchase of '+item.title+'  by ' + user.email,
       metadata:{
         id:item._id.toString(),
         user:user._id.toString(),
         type:type
       }
     };
     if(token){
       if(user.stripeCustomer){
         updateCustomerSource(token , user.stripeCustomer, function(err,customer){
           if(err) return next(err);
           charge.customer = customer.id;
           stripe.charges.create(charge, function(err, charge) {
               next(err, charge);
             });
         });
       } else{
         createCustomer(token , user, function(err,customer){
           if(err) return next(err);
           charge.customer = customer.id;
           stripe.charges.create(charge, function(err, charge) {
               next(err, charge);
             });
         });
       }
     } else if(user.stripeCustomer){
       charge.customer = user.stripeCustomer;
       stripe.charges.create(charge, function(err, charge) {
           next(err, charge);
         });
     } else {
       return next({message:'please provide a credit card'});
     }
   }




   function subscribeOrUpdateUserPlan(user, stripe_plan, user_plan, next){
      if(user.stripeSubscription){
        updateSubscription(
          user.stripeSubscription,
          stripe_plan,
          user_plan,
          user,
          function(err, subscription_id){
            next(err, subscription_id);
          }
        );
      }else{
        subscribeCustomerToPlan(
          user.stripeCustomer,
          stripe_plan,
          user_plan,
          user,
          function(err, subscription_id){
            next(err, subscription_id);
          }
        );
      }
   }



   function updateCustomerSource(token , customer_id, next){
     stripe.customers.createSource(
       customer_id,
       {source: token },
       function(err, card) {
         if(err){
           next(err);
         } else {
           stripe.customers.update(customer_id, {
             default_source: card.id
           }, function(err, customer) {
             if (err) return next(err);
             for (var i = 0; i < customer.sources.data.length; i++) {
              if(customer.default_source != customer.sources.data[i].id){
                stripe.customers.deleteCard(customer.id, customer.sources.data[i].id);
              }
             }
             next(null, customer);
           });
         }
       }
     );
   }

   function subscribeCustomerToPlan(customer_id, plan_id, plan, user , next){
      stripe.subscriptions.create({
        customer: customer_id,
        plan: plan_id
      }, function(err, subscription) {
        if(err){
          next(err);
        } else {
          user.stripeSubscription = subscription.id;
          user.plan = plan;
          user.save(function (err) {
            if (err) {
              next({message: errorHandler.getErrorMessage(err)});
            } else {
              next(err, subscription.id);
            }
          });
        }
     });
  }


  function updateSubscription(subscription_id, plan_id, plan, user , next){
    stripe.subscriptions.update(
      subscription_id,
      { plan: plan_id },
      function(err, subscription) {
        if(err){
          next(err);
        } else {
          stripe.invoices.create({
             customer: subscription.customer
           }, function(err, invoice) {
             user.plan = plan;
             user.save(function (err) {
               if (err) {
                 next({message: errorHandler.getErrorMessage(err)});
               } else {
                 next(err, subscription.id);
               }
             });
          });
        }
     });
  }

  function createCustomer(token, user, next){
    stripe.customers.create({
      description: 'Customer for '+ user.email,
      source: token
    }, function(err, customer) {
      if(err){
        next(err);
      } else {
        user.stripeCustomer = customer.id;
        user.save(function (err) {
          if (err) {
            next({message: errorHandler.getErrorMessage(err)});
          } else {
            next(err, customer);
          }
        });
       }
     });
  }



  function returnCustomerBillingInfo(customer){
    for (var i = 0; i < customer.sources.data.length; i++) {
      if(customer.sources.data[i].id === customer.default_source){
        var fields = ['last4','brand','country','exp_month','exp_year','funding','name'];
        var billing = {};
        for (var j = 0; j < fields.length; j++) {
          billing[fields[j]] = customer.sources.data[i][fields[j]];
        }
        return billing;
      }
    }
  }


  function handleStripeError(err, res){
    if(err.statusCode){
      res.status(err.statusCode).json({message:err.message});
    }else{
      res.status(500).json({message:'Something went wrong while processing your data'});
    }
  }


  module.exports = {
     returnCustomerBillingInfo:returnCustomerBillingInfo,
     handleStripeError:handleStripeError,
     subscribeOrUpdateUserPlan:subscribeOrUpdateUserPlan,
     createCustomer:createCustomer,
     updateSubscription:updateSubscription,
     subscribeCustomerToPlan:subscribeCustomerToPlan,
     purchaseItem:purchaseItem,
     stripe:stripe,
     plans:plans,
     updateCustomerSource:updateCustomerSource 
  };
