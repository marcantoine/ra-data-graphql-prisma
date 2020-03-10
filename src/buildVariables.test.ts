import { TypeKind } from 'graphql/type/introspection';
import { CREATE, DELETE, GET_LIST, GET_MANY, GET_MANY_REFERENCE, UPDATE } from 'ra-core';
import buildVariables from './buildVariables';
import { IntrospectionResult, Resource } from './constants/interfaces';

describe('buildVariables', () => {
  describe('GET_LIST', () => {
    it('returns correct variables', () => {
      const introspectionResult = {
        types: [
          {
            kind: 'INPUT_OBJECT',
            name: 'PostWhereInput',
            inputFields: [{ name: 'tags_some', type: { kind: '', name: '' } }],
          },
        ],
      };
      const params = {
        filter: {
          ids: ['foo1', 'foo2'],
          tags: { id: ['tag1', 'tag2'] },
          'author.id': 'author1',
          views: 100,
        },
        pagination: { page: 10, perPage: 10 },
        sort: { field: 'sortField', order: 'DESC' },
      };

      expect(
        buildVariables(introspectionResult as IntrospectionResult)(
          { type: { name: 'Post' } } as Resource,
          GET_LIST,
          params,
        ),
      ).toEqual({
        where: {
          id_in: ['foo1', 'foo2'],
          tags_some: { id_in: ['tag1', 'tag2'] },
          author: { id: 'author1' },
          views: 100,
        },
        first: 10,
        orderBy: 'sortField_DESC',
        skip: 90,
      });
    });
  });

  describe('CREATE', () => {
    it('returns correct variables', () => {
      const introspectionResult = {
        types: [
          {
            name: 'Post',
            fields: [
              {
                name: 'title',
              },
            ],
          },
          {
            name: 'PostCreateInput',
            kind: TypeKind.INPUT_OBJECT,
            inputFields: [
              {
                name: 'author',
                type: {
                  kind: TypeKind.NON_NULL,
                  ofType: {
                    kind: TypeKind.INPUT_OBJECT,
                    name: 'AuthorCreateOneInput',
                  },
                },
              },
              {
                name: 'editor',
                type: {
                  kind: TypeKind.NON_NULL,
                  ofType: {
                    kind: TypeKind.INPUT_OBJECT,
                    name: 'EditorCreateOneInput',
                  },
                },
              },
              {
                name: 'tags',
                type: {
                  kind: TypeKind.NON_NULL,
                  ofType: {
                    kind: TypeKind.INPUT_OBJECT,
                    name: 'TagCreateManyInput',
                  },
                },
              },
              {
                name: 'keywords',
                type: {
                  kind: TypeKind.NON_NULL,
                  ofType: {
                    kind: TypeKind.INPUT_OBJECT,
                    name: 'PostCreateKeywordInput',
                  },
                },
              },
              {
                name: 'relatedPosts',
                type: {
                  kind: TypeKind.INPUT_OBJECT,
                  name: 'RelatedPostCreateManyInput',
                  ofType: null,
                },
              },
            ],
          },
          {
            name: 'AuthorCreateOneInput',
            kind: TypeKind.INPUT_OBJECT,
            inputFields: [
              {
                name: 'connect',
                type: {
                  kind: TypeKind.NON_NULL,
                  ofType: {
                    kind: TypeKind.INPUT_OBJECT,
                    name: 'AuthorWhereUniqueInput',
                  },
                },
              },
            ],
          },
          {
            name: 'AuthorWhereUniqueInput',
            kind: TypeKind.INPUT_OBJECT,
            inputFields: [
              {
                name: 'id',
                type: {
                  kind: TypeKind.SCALAR,
                  name: 'String',
                },
              },
            ],
          },
          {
            name: 'EditorCreateOneInput',
            kind: TypeKind.INPUT_OBJECT,
            inputFields: [
              {
                name: 'connect',
                type: {
                  kind: TypeKind.NON_NULL,
                  ofType: {
                    kind: TypeKind.INPUT_OBJECT,
                    name: 'EditorWhereUniqueInput',
                  },
                },
              },
            ],
          },
          {
            name: 'EditorWhereUniqueInput',
            kind: TypeKind.INPUT_OBJECT,
            inputFields: [
              {
                name: 'id',
                type: {
                  kind: TypeKind.SCALAR,
                  name: 'String',
                },
              },
              {
                name: 'ref',
                type: {
                  kind: TypeKind.SCALAR,
                  name: 'String',
                },
              },
            ],
          },
          {
            name: 'TagCreateManyInput',
            kind: TypeKind.INPUT_OBJECT,
            inputFields: [
              {
                name: 'connect',
                type: {
                  kind: TypeKind.NON_NULL,
                  ofType: {
                    kind: TypeKind.INPUT_OBJECT,
                    name: 'TagWhereUniqueInput',
                  },
                },
              },
            ],
          },
          {
            name: 'TagWhereUniqueInput',
            kind: TypeKind.INPUT_OBJECT,
            inputFields: [
              {
                name: 'id',
                type: {
                  kind: TypeKind.SCALAR,
                  name: 'String',
                },
              },
            ],
          },
          {
            name: 'PostCreateKeywordInput',
            kind: TypeKind.INPUT_OBJECT,
            inputFields: [
              {
                name: 'set',
                type: {
                  kind: TypeKind.LIST,
                  ofType: {
                    kind: TypeKind.NON_NULL,
                    ofType: {
                      kind: TypeKind.SCALAR,
                    },
                  },
                },
              },
            ],
          },
          {
            name: 'RelatedPostCreateManyInput',
            kind: TypeKind.INPUT_OBJECT,
            inputFields: [
              {
                name: 'connect',
                type: {
                  kind: TypeKind.LIST,
                  ofType: {
                    kind: TypeKind.NON_NULL,
                    ofType: {
                      kind: TypeKind.INPUT_OBJECT,
                      name: 'RelatedPostWhereUniqueInput',
                    },
                  },
                },
              },
            ],
          },
          {
            name: 'RelatedPostWhereUniqueInput',
            kind: TypeKind.INPUT_OBJECT,
            inputFields: [
              {
                name: 'id',
                type: {
                  kind: TypeKind.SCALAR,
                  name: 'ID',
                },
              },
            ],
          },
        ],
      };

      const params = {
        data: {
          author: { id: 'author1', name: 'author1name' },
          editor: { ref: 'editor1code', code: 'editor1name' },
          title: 'Foo',
          tags: [{ id: 'tags1' }, { id: 'tags2' }],
          keywords: ['keyword1', 'keyword2'],
          relatedPostsIds: ['relatedPost1', 'relatedPost2'],
          relatedPosts: [{ id: 'relatedPost1', name: 'postName1' }, { id: 'relatedPost2', name: 'postName2' }],
        },
      };

      expect(
        buildVariables(introspectionResult as IntrospectionResult)(
          { type: { name: 'Post' } } as Resource,
          CREATE,
          params,
        ),
      ).toEqual({
        data: {
          author: { connect: { id: 'author1' } },
          editor: { connect: { ref: 'editor1code' } },
          tags: {
            connect: [{ id: 'tags1' }, { id: 'tags2' }],
          },
          keywords: { set: ['keyword1', 'keyword2'] },
          relatedPosts: {
            connect: [{ id: 'relatedPost1' }, { id: 'relatedPost2' }],
          },
          title: 'Foo',
        },
      });
    });
  });

  describe('UPDATE', () => {
    it('returns correct variables', () => {
      const introspectionResult = {
        types: [
          {
            name: 'Post',
            fields: [{ name: 'title' }],
          },
          {
            name: 'PostUpdateInput',
            kind: TypeKind.INPUT_OBJECT,
            inputFields: [
              {
                name: 'author',
                type: {
                  kind: TypeKind.NON_NULL,
                  ofType: {
                    kind: TypeKind.INPUT_OBJECT,
                    name: 'AuthorUpdateOneInput',
                  },
                },
              },
              {
                name: 'editor',
                type: {
                  kind: TypeKind.NON_NULL,
                  ofType: {
                    kind: TypeKind.INPUT_OBJECT,
                    name: 'EditorUpdateOneInput',
                  },
                },
              },
              {
                name: 'tags',
                type: {
                  kind: TypeKind.NON_NULL,
                  ofType: {
                    kind: TypeKind.INPUT_OBJECT,
                    name: 'TagsUpdateManyInput',
                  },
                },
              },
              {
                name: 'keywords',
                type: {
                  kind: TypeKind.NON_NULL,
                  ofType: {
                    kind: TypeKind.INPUT_OBJECT,
                    name: 'PostUpdateKeywordInput',
                  },
                },
              },
              {
                name: 'relatedPosts',
                type: {
                  kind: TypeKind.INPUT_OBJECT,
                  name: 'RelatedPostUpdateManyInput',
                  ofType: null,
                },
              },
            ],
          },
          {
            name: 'AuthorUpdateOneInput',
            kind: TypeKind.INPUT_OBJECT,
            inputFields: [
              {
                name: 'connect',
                type: {
                  kind: TypeKind.NON_NULL,
                  ofType: {
                    kind: TypeKind.INPUT_OBJECT,
                    name: 'AuthorWhereUniqueInput',
                  },
                },
              },
            ],
          },
          {
            name: 'EditorUpdateOneInput',
            kind: TypeKind.INPUT_OBJECT,
            inputFields: [
              {
                name: 'connect',
                type: {
                  kind: TypeKind.NON_NULL,
                  ofType: {
                    kind: TypeKind.INPUT_OBJECT,
                    name: 'EditorWhereUniqueInput',
                  },
                },
              },
            ],
          },
          {
            name: 'TagsUpdateManyInput',
            kind: TypeKind.INPUT_OBJECT,
            inputFields: [
              {
                name: 'connect',
                type: {
                  kind: TypeKind.NON_NULL,
                  ofType: {
                    kind: TypeKind.INPUT_OBJECT,
                    name: 'TagsWhereUniqueInput',
                  },
                },
              },
            ],
          },
          {
            name: 'PostUpdateKeywordInput',
            kind: TypeKind.INPUT_OBJECT,
            inputFields: [
              {
                name: 'set',
                type: {
                  kind: TypeKind.LIST,
                  ofType: {
                    kind: TypeKind.NON_NULL,
                    ofType: {
                      kind: TypeKind.SCALAR,
                    },
                  },
                },
              },
            ],
          },
          {
            name: 'RelatedPostUpdateManyInput',
            kind: TypeKind.INPUT_OBJECT,
            inputFields: [
              {
                name: 'connect',
                type: {
                  kind: TypeKind.LIST,
                  ofType: {
                    kind: TypeKind.NON_NULL,
                    ofType: {
                      kind: TypeKind.INPUT_OBJECT,
                      name: 'RelatedPostWhereUniqueInput',
                    },
                  },
                },
              },
              {
                name: 'disconnect',
                type: {
                  kind: TypeKind.LIST,
                  ofType: {
                    kind: TypeKind.NON_NULL,
                    ofType: {
                      kind: TypeKind.INPUT_OBJECT,
                      name: 'RelatedPostWhereUniqueInput',
                    },
                  },
                },
              },
            ],
          },
          {
            name: 'TagsWhereUniqueInput',
            kind: TypeKind.INPUT_OBJECT,
            inputFields: [
              {
                name: 'id',
                type: {
                  kind: TypeKind.SCALAR,
                  name: 'String',
                },
              },
            ],
          },
          {
            name: 'AuthorWhereUniqueInput',
            kind: TypeKind.INPUT_OBJECT,
            inputFields: [
              {
                name: 'id',
                type: {
                  kind: TypeKind.SCALAR,
                  name: 'String',
                },
              },
            ],
          },
          {
            name: 'EditorWhereUniqueInput',
            kind: TypeKind.INPUT_OBJECT,
            inputFields: [
              {
                name: 'ref',
                type: {
                  kind: TypeKind.SCALAR,
                  name: 'String',
                },
              },
              {
                name: 'code',
                type: {
                  kind: TypeKind.SCALAR,
                  name: 'String',
                },
              },
            ],
          },
          {
            name: 'RelatedPostWhereUniqueInput',
            kind: TypeKind.INPUT_OBJECT,
            inputFields: [
              {
                name: 'id',
                type: {
                  kind: TypeKind.SCALAR,
                  name: 'ID',
                },
              },
            ],
          },
        ],
      };

      const params = {
        data: {
          id: 'postId',
          tags: [{ id: 'tags1', code: 'tags1code' }, { id: 'tags2', code: 'tags2scode' }],
          keywords: ['keyword1', 'keyword2'],
          author: { id: 'author1', name: 'author1name' },
          editor: { ref: 'editor1code', code: 'editor1name' },
          relatedPostsIds: ['relatedPost1', 'relatedPost2'],
          relatedPosts: [{ id: 'relatedPost1', name: 'postName1' }, { id: 'relatedPost2', name: 'postName2' }],
          title: 'Foo',
        },
        previousData: {
          tags: [{ id: 'tags1' }, { id: 'tags3' }],
          keywords: ['keyword1'],
          editor: { ref: 'editor2code', code: 'editor2name' },
          relatedPosts: [{ id: 'relatedPost1', name: 'postName1' }, { id: 'relatedPost3', name: 'postName3' }],
          relatedPostsIds: ['relatedPost1', 'relatedPost3'],
        },
      };

      expect(
        buildVariables(introspectionResult as IntrospectionResult)(
          { type: { name: 'Post' } } as Resource,
          UPDATE,
          params,
        ),
      ).toEqual({
        where: { id: 'postId' },
        data: {
          author: { connect: { id: 'author1' } },
          editor: { connect: { ref: 'editor1code' } },
          tags: {
            connect: [{ id: 'tags2' }],
            disconnect: [{ id: 'tags3' }],
          },
          keywords: { set: ['keyword1', 'keyword2'] },
          relatedPosts: {
            connect: [{ id: 'relatedPost2' }],
            disconnect: [{ id: 'relatedPost3' }],
          },
          title: 'Foo',
        },
      });
    });
  });

  describe('GET_MANY', () => {
    it('returns correct variables', () => {
      const params = {
        ids: ['tag1', 'tag2'],
      };

      expect(
        buildVariables({} as IntrospectionResult)(
          { type: { name: 'Post' } } as Resource,
          GET_MANY,
          params,
        ),
      ).toEqual({
        where: { id_in: ['tag1', 'tag2'] },
      });
    });
  });

  describe('GET_MANY_REFERENCE', () => {
    it('returns correct variables', () => {
      const params = {
        target: 'author.id',
        id: 'author1',
      };

      expect(
        buildVariables({} as IntrospectionResult)(
          { type: { name: 'Post' } } as Resource,
          GET_MANY_REFERENCE,
          params,
        ),
      ).toEqual({
        where: { author: { id: 'author1' } },
      });
    });
  });

  describe('DELETE', () => {
    it('returns correct variables', () => {
      const params = {
        id: 'post1',
      };

      expect(
        buildVariables({} as IntrospectionResult)(
          { type: { name: 'Post', inputFields: [] } } as any,
          DELETE,
          params,
        ),
      ).toEqual({
        where: { id: 'post1' },
      });
    });
  });
});
