Mongo Crud
-----------

### Attention!

This is not meant to be a plugin that facilitates complex create, read, updates, or deletes.

If you have complex tasks then build a stand alone plugin. But never fear this plugin will not overwrite any routes, as CRUD routes need to be added explicitly.

### What is this plugin?

This plugin instantly adds the following functionality to any mongo db...

* Plug 'n' play CRUD Routes
* Set custom fields to hash and/or timestamp at doc creation, if required

To use...

Firstly, add any one of the following routes, to routes.js...

```javascript


// EXAMPLE
// Mongo collection of 'scans'

// Create scan
plugin.route({
    path: "/api/scan",
    method: "POST",
    config: create()
});

// Read scan
plugin.route({
    path: "/api/scan/{id}",
    method: "GET",
    config: get()
})

// Update scan
plugin.route({
    path: "/api/scan/{id}",
    method: "PUT",
    config: update()
})

// Delete scan
plugin.route({
    path: "/api/scan/{id}",
    method: "DELETE",
    config: del()
});

// Also...

// Get all
plugin.route({
    path: "/api/scans",
    method: "GET",
    config: getAll()
});
```

...then, configure routes in config.js...

```javascript

// EXAMPLE for scans mongo collection with fields including url, devices, blah blah you can see them below... 
// In this example we hash the 'url' field and add a 'requested' mongoTimestamp field before inserting
var config = {
    scan: {
        hash: 'url',
        date: 'requested',
        create: Joi.object().keys({
            url: Joi.string().required(),
            devices: Joi.array().min(1).required(),
            countries: Joi.array().min(1),
            priority: Joi.number().min(0).max(4),
            recurring: Joi.string(),
            reports: Joi.array()
        }),
        update: Joi.object().keys({
            devices: Joi.array().min(1),
            countries: Joi.array().min(1),
            priority: Joi.number().min(0).max(4),
            recurring: Joi.string(),
            reports: Joi.array(),
            requested: Joi.string()
        }),
        defaults: {
            countries: ['CA'],
            priority: 1,
            recurring: false,
            reports: [],
            completed: false,
        }
    }
};
``` 

...And your done!

## Create

**POST** /api/[resource]   <<< {payload} 

Steps...

1. Payload is Joi validated
2. Payload is extended with defaults if missing
3. Hash and/or date stamp is added to payload, if set
4. Inserted into '[resource]s' mongo collection

## Read

**GET** /api/[resource]/{id}

Steps...

1. {id} is validated in route
2. Gets _id: {id} from '[resource]s' mongo collection

## Update

**PUT** /api/[resource]/{id}   <<< {payload} 

Steps...

1. {id} is validated in route
2. Payload is Joi validated
3. Updates _id: {id} from '[resource]s' mongo collection

## Delete

**DELETE** /api/[resource]/{id}

Steps...

1. {id} is validated in route
2. Gets _id: {id} from '[resource]s' mongo collection

## Get All

**GET** /api/[resource]s

Get all docs in a collection

## Config

**GET** /api/CRUD/config

See JSON dump of ./config.js