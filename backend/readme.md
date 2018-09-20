<h2>Basc API made on KoaJS 2</h2>

<h3>Installation</h3>

```
git clone https://github.com/valera-shulghin/koa2-api-boilerplate
npm install
npm start
open http://localhost:3000/apidoc/ - slash at the end is required
```

<h3>Required extensions for editor</h3>
<ul>
    <li>ESLint - linting utility, rules are in <code>.eslintrc.json</code></li>
    <li>Beautify - code formatting according to eslint, rules are in <code>.jsbeautifyrc</code>, <code>Alt</code> +  <code>Shift</code> + <code>F</code> to format</li>
</ul>

<h3>Requirements</h3>

<ul>
    <li>NodeJS >= 7.6.0</li>
</ul>


<h3>Features</h3>
<ul>
    <li>KoaJS 2</li>
    <li>Automatic documentation generation with gulp</li>
    <li>PostgreSQL database</li>
    <li>Nice and clean error handler</li>
    <li>Single file upload example</li>
    <li>Validator</li>
    <li>Auth with JWT</li>
    <li>ESLint with airbnb rules</li>
</ul>


<h3>Errors Handling Examples</h3>

<h4>1. Validation</h4>

Endpoint: Get user profile ( `GET /users/:id` )

```javascript
ctx.checkParams('id').notEmpty().isInt()
if (ctx.errors) throw new BadRequest(ctx.errors)

const user = await User.findOne({ id: ctx.params.id })
if (!user) throw new BadRequest([{ id: 'Invalid user id' }])
```

Endpoint: Create user ( `POST /users` )

```javascript
ctx.checkBody('email').notEmpty().isEmail()
ctx.checkBody('address').empty().len(1, 255)

if (ctx.errors) throw new BadRequest(ctx.errors)
```

<h4>2. User Access</h4>

```javascript
if (!userHasAccessToThis()) throw new Forbidden("You don't have access to this module")
```

<b>Note:</b> All errors (BadRequest, Forbidden, etc) are defined in `/libraries/error` file.

Request with errors is returned like this: 

```javascript
{
    "errors": [
        {
            "field": "email",
            "message": "The email field is required"
        }
    ]
}
```



<h3>Structure</h3>

```
├── app                                     # API files
│   ├── country                             # Country module
|   |   └── get_countries_list.js           # Get countries list
|   ├── user                                # User module
|   |   ├── get_my_profile.js               # Get current user profile
|   |   ├── get_profile.js                  # Get user profile by id
|   |   ├── get_users_list.js               # Get list of users
|   |   └── login.js                        # User login
|   └── file
|   |   └── upload_single_file.js           # Upload single file
├── libraries
|   ├── error.js                            # Error types definition (Unauthorized, Forbidden, BadRequest)
|   ├── error_handler.js                    # Koa2 middleware for error handle
|   ├── jwt.js                              # JWT wrapper for token encode and decode
|   ├── knex.js                             # Knex wrapper for database connection
|   └── string.js                           # String manipulations (ex. Password encription)
├── middlewares
|   └── auth.js                             # JWT auth Koa2 middleware
├── models                                  # database operations
|   └── country.js                          # country table operations
|   ├── user.js                             # user table operations
├── .gitignode
├── env.json                                # API Config file
├── gulpfile.js                             # Gulp tasks configuration
├── index.js                                # API startup file
├── package.json
└── readme.md
```
