Changelog
===


- v1.0.0-beta6 - 2020-03-18
    - [Feature] Add `handleError` option for custom error handling
- v1.0.0-beta5 - 2020-03-14
    - [Enhancement] Add support for node UPDATE, now properly build variables when updating a record, even if this record updates nodes from relationships
        Ex: Assuming a Customer has a Theme, and a Theme has a primaryColor property, it is now possible to update the primaryColor when updating a customer (in the same mutation, through node update)
- v1.0.0-beta3 - 2020-03-10 (beta, WIP)
    - [Misc] Released under `@unly/ra-data-graphql-prisma`
    - [Enhancement] Add support for GraphCMS localised fields through `fieldAliasResolver` option

# Pre-v1
    - Released under `ra-data-graphql-prisma` from https://github.com/marcantoine/ra-data-graphql-prisma
    - Released under `ra-data-opencrud` from https://github.com/Weakky/ra-data-opencrud
