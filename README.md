[![Maintainability](https://api.codeclimate.com/v1/badges/f86e68cb7b3976d0e2ab/maintainability)](https://codeclimate.com/github/UnlyEd/ra-data-graphql-prisma/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/f86e68cb7b3976d0e2ab/test_coverage)](https://codeclimate.com/github/UnlyEd/ra-data-graphql-prisma/test_coverage)
[![Build Status](https://travis-ci.com/UnlyEd/ra-data-graphql-prisma.svg?branch=master)](https://travis-ci.com/UnlyEd/ra-data-graphql-prisma)

# @unly/ra-data-graphql-prisma

`react-admin` data provider for Prisma

### Work in progress
If you wanna give it a try anyway, here's a quick preview on codesandbox.
The API is hosted on Prisma's public servers, which means the API is limited to 10 API calls per seconds.
Be aware that it might not be working because of that, or that performances may be poor.

[![Edit ra-data-prisma](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/github/Weakky/ra-data-prisma/tree/master/examples/prisma-ecommerce)

# Summary

- [What is react admin ? And what's that ?](#what-is-react-admin-?-and-what's-ra-data-opencrud-?)
- [Installation](#installation)
- [Usage](#installation)
- [Options](#options)
- [Tips and workflow](#tips-and-workflow)
- [Contributing](#contributing)

## What is react admin ? And what's @unly/ra-data-graphql-prisma ?

[Find out more about the benefits of using `react-admin` with Prisma here.](CONTEXT.md) 

Prisma V1 offers a full graphQL CRUD Server out of the box. This module allows to use react-admin directly on Prisma Server.

This module is a fork of `ra-data-opencrud`. 

Since `ra-data-opencrud` maintainer focus on the future of back-end development with Prisma Framework (v2) and nexus-prisma, this fork allow us to maintain and fix some part of the module.

While the original module goal was to follow the `opencrud` specification, this fork mostly focus on Prisma 1. The module should however with other server following the opencrud convention.

This module is not compatible with Prisma (2) Framework & nexus-prisma.


## Installation

Install with:

```sh
npm install --save graphql @unly/ra-data-graphql-prisma
```

or

```sh
yarn add graphql @unly/ra-data-graphql-prisma
```

## Usage

This example assumes a `Post` type is defined in your datamodel.

```js
// in App.js
import React, { Component } from 'react';
import buildOpenCrudProvider from '@unly/ra-data-graphql-prisma';
import { Admin, Resource, Delete } from 'react-admin';

import { PostCreate, PostEdit, PostList } from './posts';

const client = new ApolloClient();

class App extends Component {
    constructor() {
        super();
        this.state = { dataProvider: null };
    }
    componentDidMount() {
        buildOpenCrudProvider({ clientOptions: { uri: 'your_prisma_or_graphcms_endpoint' }})
            .then(dataProvider => this.setState({ dataProvider }));
    }

    render() {
        const { dataProvider } = this.state;

        if (!dataProvider) {
            return <div>Loading</div>;
        }

        return (
            <Admin dataProvider={dataProvider}>
                <Resource name="Post" list={PostList} edit={PostEdit} create={PostCreate} remove={Delete} />
            </Admin>
        );
    }
}

export default App;
```

And that's it, `buildOpenCrudProvider` will create a default ApolloClient for you and run an [introspection](http://graphql.org/learn/introspection/) query on your Prisma/GraphCMS endpoint, listing all potential resources.

## Options

### Relation and references

In order to link to reference record using ReferenceField or ReferenceInput, `@unly/ra-data-graphql-prisma` uses a object notation (instead of snake_case or camelCase as seen in the react-admin documentation)

```js
<ReferenceInput source="company.id" reference="Company">
    <SelectInput optionText="id" />
</ReferenceInput>
```

Exception :
The reference in a ReferenceArrayField is with camelCase : this field has not been managed yet.

### Customize the Apollo client

You can either supply the client options by calling `buildOpenCrudProvider` like this:

```js
buildOpenCrudProvider({ clientOptions: { uri: 'your_prisma_or_graphcms_endpoint', ...otherApolloOptions } });
```

Or supply your client directly with:

```js
buildOpenCrudProvider({ client: myClient });
```

### Overriding a specific query

The default behavior might not be optimized especially when dealing with references. You can override a specific query by decorating the `buildQuery` function:

#### With a whole query

```js
// in src/dataProvider.js
import buildOpenCrudProvider, { buildQuery } from '@unly/ra-data-graphql-prisma';

const enhanceBuildQuery = introspection => (fetchType, resource, params) => {
    const builtQuery = buildQuery(introspection)(fetchType, resource, params);

    if (resource === 'Command' && fetchType === 'GET_ONE') {
        return {
            // Use the default query variables and parseResponse
            ...builtQuery,
            // Override the query
            query: gql`
                query Command($id: ID!) {
                    data: Command(id: $id) {
                        id
                        reference
                        customer {
                            id
                            firstName
                            lastName
                        }
                    }
                }`,
        };
    }

    return builtQuery;
}

export default buildOpenCrudProvider({ buildQuery: enhanceBuildQuery })
```

#### Or using fragments

You can also override a query using the same API `graphql-binding` offers.

`buildQuery` accept a fourth parameter which is a fragment that will be used as the final query.

```js
// in src/dataProvider.js
import buildOpenCrudProvider, { buildQuery } from '@unly/ra-data-graphql-prisma';

const enhanceBuildQuery = introspection => (fetchType, resource, params) => {
    if (resource === 'Command' && fetchType === 'GET_ONE') {
        // If you need auto-completion from your IDE, you can also use gql and provide a valid fragment
        return buildQuery(introspection)(fetchType, resource, params, `{
            id
            reference
            customer { id firstName lastName }
        }`);
    }

    return buildQuery(introspection)(fetchType, resource, params);
}

export default buildOpenCrudProvider({ buildQuery: enhanceBuildQuery })
```

As this approach can become really cumbersome, you can find a more elegant way to pass fragments in the example under `/examples/prisma-ecommerce` 

### Customize the introspection

These are the default options for introspection:

```js
const introspectionOptions = {
    include: [], // Either an array of types to include or a function which will be called for every type discovered through introspection
    exclude: [], // Either an array of types to exclude or a function which will be called for every type discovered through introspection
}

// Including types
const introspectionOptions = {
    include: ['Post', 'Comment'],
};

// Excluding types
const introspectionOptions = {
    exclude: ['CommandItem'],
};

// Including types with a function
const introspectionOptions = {
    include: type => ['Post', 'Comment'].includes(type.name),
};

// Including types with a function
const introspectionOptions = {
    exclude: type => !['Post', 'Comment'].includes(type.name),
};
```

**Note**: `exclude` and `include` are mutualy exclusives and `include` will take precendance.

**Note**: When using functions, the `type` argument will be a type returned by the introspection query. Refer to the [introspection](http://graphql.org/learn/introspection/) documentation for more information.

Pass the introspection options to the `buildApolloProvider` function:

```js
buildApolloProvider({ introspection: introspectionOptions });
```

## Tips and workflow

### Performance issues
As react-admin was originally made for REST endpoints, it cannot always take full advantage of GraphQL's benefits.

Although `react-admin` already has a load of built-in optimizations ([Read more here](marmelab.com/blog/2016/10/18/using-redux-saga-to-deduplicate-and-group-actions.html) and [here](https://github.com/marmelab/react-admin/issues/2243)),
it is not yet well suited when fetching n-to-many relations (multiple requests will be sent).

To counter that limitation, as shown above, you can override queries to directly provide all the fields that you will need to display your view.

#### Suggested workflow

As overriding all queries can be cumbersome, **this should be done progressively**.

- Start by using `react-admin` the way you're supposed to (using `<ReferenceField />` and `<ReferenceManyField />` when trying to access references)
- Detect the hot-spots
- Override the queries on those hot-spots by providing all the fields necessary (as [shown above](#or-using-fragments))
- Replace the `<ReferenceField />` by simple fields (such as `<TextField />`) by accessing the resource in the following way: `<TextField source="product.name" />`
- Replace the `<ReferenceManyField />` by `<ArrayField />` using the same technique as above

## Contributing

Use the example under `examples/prisma-ecommerce` as a playground for improving `@unly/ra-data-graphql-prisma`.

To easily enhance `@unly/ra-data-graphql-prisma` and get the changes reflected on `examples/prisma-ecommerce`, do the following:

- `cd @unly/ra-data-graphql-prisma`
- `yarn link`
- `cd examples/prisma-ecommerce`
- `yarn link @unly/ra-data-graphql-prisma`

Once this is done, the `@unly/ra-data-graphql-prisma` dependency will be replaced by the one on the repository.
**One last thing, don't forget to transpile the library with babel by running the following command on the root folder**


```sh
yarn watch
```

You should now be good to go ! Run the tests with this command:

```sh
jest
```
### Known issues

#### Yarn install error on fsevent

When installing a local environment using yarn and a node version > 10, a problem might occurs while installing some dependencies (fsevent).
Running the following command appears to fix the problem

```sh
yarn cache clean && yarn upgrade && yarn
```

Related issues : https://github.com/yarnpkg/yarn/issues/3926
