<a href="https://unly.org"><img src="https://storage.googleapis.com/unly/images/ICON_UNLY.png" align="right" height="20" alt="Unly logo" title="Unly logo" /></a>
[![Version][github-version-image]][github-version-url]
[![Liscence][github-liscence-image]][github-liscence-url][![Releases][github-all-release-image]][github-all-release-url][![NPM Downloads][npm-downloads-image]][npm-downloads-url]
[![Maintainability](https://api.codeclimate.com/v1/badges/f86e68cb7b3976d0e2ab/maintainability)](https://codeclimate.com/github/UnlyEd/ra-data-graphql-prisma/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/f86e68cb7b3976d0e2ab/test_coverage)](https://codeclimate.com/github/UnlyEd/ra-data-graphql-prisma/test_coverage)
[![Build Status](https://travis-ci.com/UnlyEd/ra-data-graphql-prisma.svg?branch=master)](https://travis-ci.com/UnlyEd/ra-data-graphql-prisma)

# @unly/ra-data-graphql-prisma

`react-admin` data provider for Prisma (v1), used by [https://github.com/UnlyEd/next-right-now-admin](https://github.com/UnlyEd/next-right-now-admin)

> # Status: STABLE - NON-MAINTAINED
>
> This package has been released under **v1.0.0 version and is considered stable**.
>
> Note that we do **not** intend on maintaining it. Issues are open for questions but **do not expect bug fixes**. 
>
> As of April 2020, this package is **probably the most advanced** of all forks created from [https://github.com/Weakky/ra-data-opencrud](https://github.com/Weakky/ra-data-opencrud/network/members) and can be used to build your own fork.

## Overview of changes

See [CHANGELOG](./CHANGELOG.md)

> Basically, this package has improved TS support, fixed Jest tests and added more features for nested relationships, image upload, and more, compared to it's [upstream origin](https://github.com/marcantoine/ra-data-graphql-prisma).
>
> Also, it's used in a **live demo** and allows you to **get started quickly with react-admin**.

## Live demo

- Admin site using `@unly/ra-data-graphql-prisma@1.0.0`: [Live demo](https://nrn-admin.unly.now.sh/) - [Source code](https://github.com/UnlyEd/next-right-now-admin)
- Online demo (managed by the above admin site):
    - [https://nrn-v1-ssr-mst-aptd-gcms-lcz-sty-c1.now.sh/](https://nrn-v1-ssr-mst-aptd-gcms-lcz-sty-c1.now.sh/)
    - [https://nrn-v1-ssr-mst-aptd-gcms-lcz-sty-c2.now.sh/](https://nrn-v1-ssr-mst-aptd-gcms-lcz-sty-c2.now.sh/)

## Why again another fork?

### Our motivations

We wanted to build our own admin backoffice to manage our content. But the task has revealed itself much more complicated than what I thought it'd be.

- React-admin is much harder to use than what I hoped for:
    - It lacks TS support and extensive documentation, cost of learning is very high
    - Official examples are often outdated
    - Finding community help wasn't as easy as expected, despite a 12K+ stars counter
    - In short, the cost of "getting started" is much, much higher than expected and broke our confidence in our ability to deliver a product of quality on time
- The "react-admin <> GraphQL" data provider [I had found](https://github.com/Weakky/ra-data-opencrud) when building my initial POC isn't maintained and not advanced enough for our use cases
- We had to spend quite some time finding a proper alternative ([fork](https://github.com/marcantoine/ra-data-graphql-prisma)), but despite being used in production it was still not advanced enough and was lacking a lot of good practices (huge npm package, outdated TS, broken tests, etc.)
- We learned that the GraphCMS API we're using would change it's API in a breaking way, which would force us to update this package again in the future
- At this point we believe there was too many issues with the whole things, and too many chances that something would go wrong and would stop us from growing (ROI)
- Thus, we decided to find another alternative and released this package under a stable and documented version, for other people to have a better experience than we did.
    - For the record, we've found other potential alternatives, such as [Directus](https://directus.io/) and [Frappe](https://frappe.io/docs) which I recommend to take a look at.

### A bit of history...

- https://github.com/Weakky/ra-data-opencrud was created in 2018, but hasn't been updated since Oct. 2018
- https://github.com/marcantoine/ra-data-graphql-prisma took over from `ra-data-opencrud` and is still maintained, it's also used in a production app (private)
- https://github.com/UnlyEd/ra-data-graphql-prisma was created in 2020 from `ra-data-graphql-prisma`, because too many changes were needed and we needed to do them fast

### Why use this one?
- https://www.npmjs.com/search?q=ra-data-prisma lists 11 packages, there are no 1.0.0 version, everything is 0.x
- All packages are at least 180kB, some even go up to 500+... **This one is around 90kB**
- It's used by https://github.com/UnlyEd/next-right-now-admin, which features a real GraphCMS demo
- See [CHANGELOG](CHANGELOG.md) for details, features, etc.

---

<!-- toc -->

  * [What is react admin ? And what's @unly/ra-data-graphql-prisma ?](#what-is-react-admin--and-whats-unlyra-data-graphql-prisma-)
  * [Installation](#installation)
  * [Usage](#usage)
  * [Options](#options)
    + [Relation and references](#relation-and-references)
    + [Customize the Apollo client](#customize-the-apollo-client)
    + [Overriding a specific query](#overriding-a-specific-query)
      - [With a whole query](#with-a-whole-query)
      - [Or using fragments](#or-using-fragments)
    + [Customize the introspection](#customize-the-introspection)
  * [Tips and workflow](#tips-and-workflow)
    + [Performance issues](#performance-issues)
      - [Suggested workflow](#suggested-workflow)
  * [Contributing](#contributing)
    + [Known issues](#known-issues)
      - [Yarn install error on fsevent](#yarn-install-error-on-fsevent)
- [Contributing](#contributing-1)
  * [Working locally](#working-locally)
  * [Test](#test)
  * [Versions](#versions)
    + [SemVer](#semver)
  * [Releasing and publishing](#releasing-and-publishing)
- [Changelog](#changelog)
- [License](#license)
- [Vulnerability disclosure](#vulnerability-disclosure)
- [Contributors and maintainers](#contributors-and-maintainers)
- [**[ABOUT UNLY]**](#about-unly-)

<!-- tocstop -->

---

## What is react admin ? And what's @unly/ra-data-graphql-prisma ?

[Find out more about the benefits of using `react-admin` with Prisma here.](CONTEXT.md) 

Prisma V1 offers a full graphQL CRUD Server out of the box. This module allows to use react-admin directly on Prisma Server.

> This module is a fork of `ra-data-graphql-prisma`, itself a fork of `ra-data-opencrud`. 

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

> This example assumes a `Post` type is defined in your datamodel. It's based on `create-react-app`.

```js
// in App.js
import React, { Component } from 'react';
import buildGraphQLProvider from '@unly/ra-data-graphql-prisma';
import { Admin, Resource, Delete } from 'react-admin';

import { PostCreate, PostEdit, PostList } from './posts';

const client = new ApolloClient();

class App extends Component {
    constructor() {
        super();
        this.state = { dataProvider: null };
    }
    componentDidMount() {
        buildGraphQLProvider({ clientOptions: { uri: 'your_prisma_or_graphcms_endpoint' }})
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

And that's it, `buildGraphQLProvider` will create a default ApolloClient for you and run an [introspection](http://graphql.org/learn/introspection/) query on your Prisma/GraphCMS endpoint, listing all potential resources.

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

You can either supply the client options by calling `buildGraphQLProvider` like this:

```js
buildGraphQLProvider({ clientOptions: { uri: 'your_prisma_or_graphcms_endpoint', ...otherApolloOptions } });
```

Or supply your client directly with:

```js
buildGraphQLProvider({ client: myClient });
```

### Overriding a specific query

The default behavior might not be optimized especially when dealing with references. You can override a specific query by decorating the `buildQuery` function:

#### With a whole query

```js
// in src/dataProvider.js
import buildGraphQLProvider, { buildQuery } from '@unly/ra-data-graphql-prisma';

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

export default buildGraphQLProvider({ buildQuery: enhanceBuildQuery })
```

#### Or using fragments

You can also override a query using the same API `graphql-binding` offers.

`buildQuery` accept a fourth parameter which is a fragment that will be used as the final query.

```js
// in src/dataProvider.js
import buildGraphQLProvider, { buildQuery } from '@unly/ra-data-graphql-prisma';

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

export default buildGraphQLProvider({ buildQuery: enhanceBuildQuery })
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

**Note**: `exclude` and `include` are mutually exclusives and `include` will take precedence.

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



---

# Contributing

We gladly accept PRs, but please open an issue first so we can discuss it beforehand.

## Working locally

```
yarn start # Shortcut - Runs linter + build + tests in concurrent mode (watch mode)

OR run each process separately for finer control

yarn lint
yarn build
yarn test
```

## Test

```
yarn test # Run all tests, interactive and watch mode
yarn test:once
yarn test:coverage
```

## Versions

### SemVer

We use Semantic Versioning for this project: https://semver.org/. (`vMAJOR.MINOR.PATCH`: `v1.0.1`)

- Major version: Must be changed when Breaking Changes are made (public API isn't backward compatible).
  - A function has been renamed/removed from the public API
  - Something has changed that will cause the app to behave differently with the same configuration
- Minor version: Must be changed when a new feature is added or updated (without breaking change nor behavioral change)
- Patch version: Must be changed when any change is made that isn't either Major nor Minor. (Misc, doc, etc.)

## Releasing and publishing

```
yarn releaseAndPublish # Shortcut - Will prompt for bump version, commit, create git tag, push commit/tag and publish to NPM

yarn release # Will prompt for bump version, commit, create git tag, push commit/tag
npm publish # Will publish to NPM
```

> Don't forget we are using SemVer, please follow our SemVer rules.

**Pro hint**: use `beta` tag if you're in a work-in-progress (or unsure) to avoid releasing WIP versions that looks legit

---

# Changelog

> Our API change (including breaking changes and "how to migrate") are documented in the Changelog.

See [changelog](./CHANGELOG.md)

---

# License

MIT

# Vulnerability disclosure

[See our policy](https://github.com/UnlyEd/Unly).

---

# Contributors and maintainers

This project is being maintained by:
- [Unly] Ambroise Dhenain ([Vadorequest](https://github.com/vadorequest)) **(active)**

---

# **[ABOUT UNLY]** <a href="https://unly.org"><img src="https://storage.googleapis.com/unly/images/ICON_UNLY.png" height="40" align="right" alt="Unly logo" title="Unly logo" /></a>

> [Unly](https://unly.org) is a socially responsible company, fighting inequality and facilitating access to higher education. 
> Unly is committed to making education more inclusive, through responsible funding for students. 
We provide technological solutions to help students find the necessary funding for their studies. 
We proudly participate in many TechForGood initiatives. To support and learn more about our actions to make education accessible, visit : 
- https://twitter.com/UnlyEd
- https://www.facebook.com/UnlyEd/
- https://www.linkedin.com/company/unly
- [Interested to work with us?](https://jobs.zenploy.io/unly/about)

Tech tips and tricks from our CTO on our [Medium page](https://medium.com/unly-org/tech/home)!

#TECHFORGOOD #EDUCATIONFORALL


[github-all-release-image]: https://img.shields.io/github/downloads/UnlyEd/ra-data-graphql-prisma/total
[github-all-release-url]: https://github.com/UnlyEd/ra-data-graphql-prisma/releases
[github-liscence-image]: https://img.shields.io/github/license/UnlyEd/ra-data-graphql-prisma
[github-liscence-url]: ./LICENSE
[github-version-image]: https://img.shields.io/github/package-json/v/UnlyEd/ra-data-graphql-prisma
[github-version-url]: ./package.json
[npm-downloads-url]: https://www.npmjs.com/package/@unly/ra-data-graphql-prisma
[npm-downloads-image]: https://img.shields.io/npm/dm/@unly/ra-data-graphql-prisma
