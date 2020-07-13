const express = require ('express');
const bookmarksRouter = express.Router();
const bodyParser = express.json();
const logger = require('../logger');
const BookmarksService = require(`./bookmarks-service`);
const xss = require('xss');
const supertest = require('supertest');



bookmarksRouter
  .route('/bookmarks')
  .get((req, res, next) => {
    BookmarksService.getAllBookmarks(req.app.get('db'))
      .then(bookmarks => {
        res.json(bookmarks);
      })
      .catch(next)
  })
  .post(bodyParser, (req, res, next) => {
    const { title, url, description, rating } = req.body
    const newBookmark = {title, url, description, rating }

    for(const[key, value] of Object.entries(newBookmark)) {
      if (value == null) {
        return res.status(400).json({
          error : { message: `Missing '${key}' in request body`}
        })
      }
    }
    BookmarksService.insertBookmark(req.app.get('db'), newBookmark)
      .then(bookmark => {
        res
          .status(201)
          .location(`/bookmarks/${bookmark.id}`)
          .json({
            id: bookmark.id,
            title: xss(bookmark.title),
            url: xss(bookmark.url),
            description: xss(bookmark.description),
            rating: bookmark.rating,
          })
      })
      .catch(next)
    
  })

bookmarksRouter
  .route('/bookmarks/:bookmark_id')
  .all((req, res, next) => {
    const { bookmark_id } = req.params
    BookmarksService.getById(req.app.get('db'), bookmark_id)
      .then(bookmark => {
        if (!bookmark) {
          // logger.error(`Bookmark with id ${bookmark_id} not found.`)
          return res.status(404).json({
            error: { message: `Bookmark Not Found` }
          })
        }
        res.bookmark = bookmark
        next()
      })
      .catch(next)
  })
  .get((req, res) => {
    res.json({
      id: res.bookmark.id,
      title: res.bookmark.title,
      url: res.bookmark.url,
      description: res.bookmark.description,
      rating: res.bookmark.rating
    })
  })
  .delete((req, res, next) => {
    const { bookmark_id } = req.params
    BookmarksService.deleteBookmark(
      req.app.get('db'),
      bookmark_id
    )
      .then(numRowsAffected => {
        logger.info(`Bookmark with id ${bookmark_id} deleted.`)
        res.status(204).end()
      })
      .catch(next)
  })

  module.exports = bookmarksRouter;