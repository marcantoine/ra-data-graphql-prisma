import { DocumentNode, IntrospectionField, print, TypeKind } from 'graphql';
import { CREATE, DELETE, GET_LIST, GET_MANY, GET_MANY_REFERENCE, GET_ONE, UPDATE } from 'ra-core';
import buildGqlQuery, { buildApolloArgs, buildArgs, buildFields, getArgType, Query } from './buildGqlQuery';
import { IntrospectionResult, Resource } from './constants/interfaces';

describe('getArgType', () => {
  it('returns the arg type', () => {
    expect(
      print(
        getArgType({
          type: { kind: TypeKind.SCALAR, name: 'foo' },
        } as IntrospectionField),
      ),
    ).toEqual('foo');
  });

  it('returns the arg type for NON_NULL types', () => {
    expect(
      print(
        getArgType({
          type: {
            kind: TypeKind.NON_NULL,
            ofType: { name: 'ID', kind: TypeKind.SCALAR },
          },
        } as IntrospectionField),
      ),
    ).toEqual('ID!');
  });

  it('returns the arg type for LIST types', () => {
    expect(
      print(
        getArgType({
          type: {
            kind: TypeKind.LIST,
            ofType: { name: 'ID', kind: TypeKind.SCALAR },
          },
        } as IntrospectionField),
      ),
    ).toEqual('[ID]');
  });

  it('returns the arg type for LIST types of NON_NULL type', () => {
    expect(
      print(
        getArgType({
          type: {
            kind: TypeKind.LIST,
            ofType: {
              kind: TypeKind.NON_NULL,
              ofType: {
                kind: TypeKind.SCALAR,
                name: 'ID',
              },
            },
          },
        } as IntrospectionField),
      ),
    ).toEqual('[ID!]');
  });
});

describe('buildArgs', () => {
  it('returns an empty array when query does not have any arguments', () => {
    expect(buildArgs({ args: [] } as Query)).toEqual([]);
  });

  it('returns an array of args correctly filtered when query has arguments', () => {
    expect(
      print(
        // @ts-ignore
        buildArgs({ args: [{ name: 'foo' }, { name: 'bar' }] } as Query, {
          foo: 'foo_value',
        }),
      ),
    ).toEqual(['foo: $foo']);
  });
});

describe('buildApolloArgs', () => {
  it('returns an empty array when query does not have any arguments', () => {
    // @ts-ignore
    expect(print(buildApolloArgs({ args: [] }))).toEqual([]);
  });

  it('returns an array of args correctly filtered when query has arguments', () => {
    expect(
      print(
        // @ts-ignore
        buildApolloArgs(
          {
            args: [
              {
                name: 'foo',
                type: {
                  kind: TypeKind.NON_NULL,
                  ofType: {
                    kind: TypeKind.SCALAR,
                    name: 'Int',
                  },
                },
              },
              {
                name: 'barId',
                type: { kind: TypeKind.SCALAR, name: 'ID' },
              },
              {
                name: 'barIds',
                type: {
                  kind: TypeKind.LIST,
                  ofType: {
                    kind: TypeKind.NON_NULL,
                    ofType: {
                      kind: TypeKind.SCALAR,
                      name: 'ID',
                    },
                  },
                },
              },
              { name: 'bar' },
            ],
          } as Query,
          { foo: 'foo_value', barId: 100, barIds: [101, 102] },
        ),
      ),
    ).toEqual(['$foo: Int!', '$barId: ID', '$barIds: [ID!]']);
  });
});

describe('buildFields', () => {
  it('returns an object with the fields to retrieve', () => {
    const introspectionResults = {
      resources: [{ type: { name: 'resourceType' } }],
      types: [
        {
          name: 'linkedType',
          fields: [
            {
              name: 'id',
              type: { kind: TypeKind.SCALAR, name: 'ID' },
            },
          ],
        },
      ],
    };

    const fields = [
      { type: { kind: TypeKind.SCALAR, name: 'ID' }, name: 'id' },
      {
        type: { kind: TypeKind.SCALAR, name: '_internalField' },
        name: 'foo1',
      },
      {
        type: { kind: TypeKind.OBJECT, name: 'linkedType' },
        name: 'linked',
      },
      {
        type: { kind: TypeKind.OBJECT, name: 'resourceType' },
        name: 'resource',
      },
    ];

    expect(
      print(
        // @ts-ignore
        buildFields(introspectionResults as IntrospectionResult)(fields as any),
      ),
    ).toEqual([
      'id',
      `linked {
  id
}`,
      `resource {
  id
}`,
    ]);
  });
});

describe('buildGqlQuery', () => {
  const introspectionResults = {
    resources: [{ type: { name: 'resourceType' } }],
    types: [
      {
        name: 'linkedType',
        fields: [
          {
            name: 'foo',
            type: { kind: TypeKind.SCALAR, name: 'bar' },
          },
        ],
      },
    ],
  };

  const resource = {
    type: {
      fields: [
        { type: { kind: TypeKind.SCALAR, name: '' }, name: 'foo' },
        { type: { kind: TypeKind.SCALAR, name: '_foo' }, name: 'foo1' },
        {
          type: { kind: TypeKind.OBJECT, name: 'linkedType' },
          name: 'linked',
        },
        {
          type: { kind: TypeKind.OBJECT, name: 'resourceType' },
          name: 'resource',
        },
      ],
    },
  };

  const queryType = {
    name: 'commands',
    args: [
      {
        name: 'foo',
        type: {
          kind: TypeKind.NON_NULL,
          ofType: { kind: TypeKind.SCALAR, name: 'Int' },
        },
      },
      {
        name: 'barId',
        type: { kind: TypeKind.SCALAR },
      },
      {
        name: 'barIds',
        type: { kind: TypeKind.SCALAR },
      },
      { name: 'bar' },
    ],
  };
  const params = { foo: 'foo_value' };

  it.skip('returns the correct query for GET_LIST', () => {
    expect(
      print(
        // @ts-ignore
        buildGqlQuery(introspectionResults as IntrospectionResult)(
          // @ts-ignore
          resource as Resource,
          GET_LIST,
          queryType as Query,
          params,
          {} as DocumentNode,
        ),
      ),
    ).toEqual(
      `query commands($foo: Int!) {
  items: commands(foo: $foo) {
    foo
    linked {
      foo
    }
    resource {
      id
    }
  }
  total: commandsConnection(foo: $foo) {
    aggregate {
      count
    }
  }
}
`,
    );
  });
  it.skip('returns the correct query for GET_MANY', () => {
    expect(
      print(
        // @ts-ignore
        buildGqlQuery(introspectionResults as IntrospectionResult)(
          // @ts-ignore
          resource as Resource,
          GET_MANY,
          queryType as Query,
          params,
          {} as DocumentNode,
        ),
      ),
    ).toEqual(
      `query commands($foo: Int!) {
  items: commands(foo: $foo) {
    foo
    linked {
      foo
    }
    resource {
      id
    }
  }
  total: commandsConnection(foo: $foo) {
    aggregate {
      count
    }
  }
}
`,
    );
  });
  it.skip('returns the correct query for GET_MANY_REFERENCE', () => {
    expect(
      print(
        // @ts-ignore
        buildGqlQuery(introspectionResults as IntrospectionResult)(
          // @ts-ignore
          resource as Resource,
          GET_MANY_REFERENCE,
          queryType as Query,
          params,
          {} as DocumentNode,
        ),
      ),
    ).toEqual(
      `query commands($foo: Int!) {
  items: commands(foo: $foo) {
    foo
    linked {
      foo
    }
    resource {
      id
    }
  }
  total: commandsConnection(foo: $foo) {
    aggregate {
      count
    }
  }
}
`,
    );
  });
  it.skip('returns the correct query for GET_ONE', () => {
    expect(
      print(
        // @ts-ignore
        buildGqlQuery(introspectionResults as IntrospectionResult)(
          // @ts-ignore
          resource as Resource,
          GET_ONE,
          { ...queryType, name: 'getCommand' } as Query,
          params,
          {} as DocumentNode,
        ),
      ),
    ).toEqual(
      `query getCommand($foo: Int!) {
  data: getCommand(foo: $foo) {
    foo
    linked {
      foo
    }
    resource {
      id
    }
  }
}
`,
    );
  });
  it.skip('returns the correct query for UPDATE', () => {
    expect(
      print(
        // @ts-ignore
        buildGqlQuery(introspectionResults as IntrospectionResult)(
          // @ts-ignore
          resource as Resource,
          UPDATE,
          { ...queryType, name: 'updateCommand' } as Query,
          params,
          {} as DocumentNode,
        ),
      ),
    ).toEqual(
      `mutation updateCommand($foo: Int!) {
  data: updateCommand(foo: $foo) {
    foo
    linked {
      foo
    }
    resource {
      id
    }
  }
}
`,
    );
  });
  it.skip('returns the correct query for CREATE', () => {
    expect(
      print(
        // @ts-ignore
        buildGqlQuery(introspectionResults as IntrospectionResult)(
          // @ts-ignore
          resource as Resource,
          CREATE,
          { ...queryType, name: 'createCommand' } as Query,
          params,
          {} as DocumentNode,
        ),
      ),
    ).toEqual(
      `mutation createCommand($foo: Int!) {
  data: createCommand(foo: $foo) {
    foo
    linked {
      foo
    }
    resource {
      id
    }
  }
}
`,
    );
  });
  it.skip('returns the correct query for DELETE', () => {
    expect(
      print(
        // @ts-ignore
        buildGqlQuery(introspectionResults as IntrospectionResult)(
          // @ts-ignore
          resource as Resource,
          DELETE,
          { ...queryType, name: 'deleteCommand' } as Query,
          params,
          {} as DocumentNode,
        ),
      ),
    ).toEqual(
      `mutation deleteCommand($foo: Int!) {
  data: deleteCommand(foo: $foo) {
    id
  }
}
`,
    );
  });
});
