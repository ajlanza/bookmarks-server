const knex = require('knex')
const app = require('../src/app')
const supertest = require('supertest')
const { makeBookmarksArray } = require('./bookmarks.fixtures')

describe.only('Bookmarks Endpoints', () => {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })
  after(`disconnect from db`, () => db.destroy())
  before(`clean the table`, () => db(`bookmarks`).truncate())
  afterEach(`cleanup`, () => db(`bookmarks`).truncate())

  describe(`GET /bookmarks`, () => {
    context(`Given no bookmarks`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get(`/bookmarks`)
          .expect(200, [])
      })
    })
  })

  describe(`GET /bookmarks/:bookmarks_id`, () => {
    context(`Given no bookmarks`, () => {
      it(`responds with 404`, () => {
        const bookmark_id = 5
        return supertest(app)
          .get(`/bookmarks/${bookmark_id}`)
          .expect(404)
      })
    })
  })
})