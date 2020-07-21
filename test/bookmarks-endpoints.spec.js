const knex = require('knex')
const app = require('../src/app')
const supertest = require('supertest')
const { makeBookmarksArray, makeMaliciousBookmark } = require('./bookmarks.fixtures')
const { expect } = require('chai')
const bookmarksRouter = require('../src/bookmarks/bookmarks-router')

describe('Bookmarks Endpoints', () => {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })
  after(`disconnect from db`, () => db.destroy())
  before(`clean the table`, () => db(`bookmarks`).truncate())
  afterEach(`cleanup`, () => db(`bookmarks`).truncate())

  describe(`GET /api/bookmarks`, () => {
    context(`Given no bookmarks`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get(`/api/bookmarks`)
          .expect(200, [])
      })
    })
  })

  describe(`GET /api/bookmarks/:bookmarks_id`, () => {
    context(`Given no bookmarks`, () => {
      it(`responds with 404`, () => {
        const bookmark_id = 5
        return supertest(app)
          .get(`/api/bookmarks/${bookmark_id}`)
          .expect(404)
      })
    })
  })

  describe(`POST /api/bookmarks`, () => {
    it(`creates a bookmark, responding with 201 and the new bookmark`, () => {
      const newBookmark  = {
        title: 'NEW bookmark title',
        url: 'https://www.NEW_URL.com',
        description: 'NEW description',
        rating: 5,
      }
      return supertest(app)
        .post(`/api/bookmarks`)
        .send(newBookmark)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(newBookmark.title)
          expect(res.body.url).to.eql(newBookmark.url)
          expect(res.body.description).to.eql(newBookmark.description)
          expect(res.body.rating).to.eql(newBookmark.rating)
          expect(res.body).to.have.property('id')
          expect(res.headers.location).to.eql(`/api/bookmarks/${res.body.id}`)
        })
        .then(res => 
          supertest(app)
            .get(`/api/bookmarks/${res.body.id}`)
            .expect(res.body)
        )
    })

    const requiredFields = ['title', 'url', 'description', 'rating']
    requiredFields.forEach(field => {
      const newBookmark = {
        title: 'Test title',
        url: 'Test url',
        description:'Test Description',
        rating: 4
      }

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newBookmark[field]

        return supertest(app)
          .post('/api/bookmarks')
          .send(newBookmark)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      })
    })
    it('removes xss attack content from response', () => {
      const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark()
      return supertest(app)
        .post(`/api/bookmarks`)
        .send(maliciousBookmark)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(expectedBookmark.title)
          expect(res.body.description).to.eql(expectedBookmark.description)
        })
    })
  })

  describe(`/DELETE /api/bookmarks/:bookmark_id`, () => {
    context(`Given there are articles in the database`, () =>{
      const testBookmarks = makeBookmarksArray()

      beforeEach(`insert articles`, () => {
        return db
          .into(`bookmarks`)
          .insert(testBookmarks)
      })

      it(`responds with 204 and remove the article`, () => {
        const idToRemove = 2
        const expectedBookmarks = testBookmarks.filter(bookmark => bookmark.id !== idToRemove)
        return supertest(app)
          .delete(`/api/bookmarks/${idToRemove}`)
          .expect(204)
          .then(res => 
            supertest(app)
              .get(`/api/bookmarks`)
              .expect(expectedBookmarks)
          )
      })
    })
  })

  describe(`PATCH /api/bookmarks`, () => {
    context(`Given no bookmarks`, () => {
      it(`responds with 404`, () => { 
        const bookmark_id = 12345
        return supertest(app)
          .patch(`/api/bookmarks/${bookmark_id}`)
          .expect(404, { error: { message: `Bookmark Not Found` } })
      })
    })

    context(`Given there are articles in the database`, () => {
      const testBookmarks = makeBookmarksArray()

      beforeEach(`insert bookmarks`, () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks)
      })

      it(`responds with 204 and updates the article`, () => {
        const idToUpdate = 2
        const updateBookmark = {
          id: 2,
          title: "Updated",
          url:"https:www.codewars.com.updated",
          description: "Practice what you've been updating.",
          rating: 5
        }
        const expectedBookmark = {
          ...testBookmarks[idToUpdate - 1],
          ...updateBookmark
        }
        return supertest(app)
          .patch(`/api/bookmarks/${idToUpdate}`)
          .send(updateBookmark)
          .expect(204)
          .then(res => 
            supertest(app)
            .get(`/api/bookmarks/${idToUpdate}`)
            .expect(expectedBookmark)
          )
      })

      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2
        return supertest(app)
          .patch(`/api/bookmarks/${idToUpdate}`)
          .send({ irrelevantField: 'goat' })
          .expect(400, { 
            error: { 
              message: `Request body must contain either 'title', 'url', 'description', or 'rating'`
            }
          })
      })

      it(`responds with 204 when updating only a subset of fields`, () => {
        const idToUpdate = 2
        const updateBookmark = {
          title: `updated article title`,
        }
        const expectedBookmark = {
          ...testBookmarks[idToUpdate -1],
          ...updateBookmark
        }

        return supertest(app)
          .patch(`/api/bookmarks/${idToUpdate}`)
          .send({
            ...updateBookmark,
            fieldToIgnore: 'should not be in Get response'
          })
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/bookmarks/${idToUpdate}`)
              .expect(expectedBookmark)
          )
      })
    })
  })
})
