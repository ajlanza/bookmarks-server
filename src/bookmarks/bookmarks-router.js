const express = require ('express');
const bookmarksRouter = express.Router();
const bodyParser = express.json();
const { bookmarks } = require('../store');
const logger = require('../logger');
const { v4: uuid } = require('uuid');
const BookmarksService = require(`./bookmarks-service`);
// const { router } = require('../app');


bookmarksRouter
  .route('/bookmarks')
  .get((req, res, next) => {
    BookmarksService.getAllBookmarks(req.app.get('db'))
      .then(bookmarks => {
        res.json(bookmarks);
      })
      .catch(next)
  })
  .post(bodyParser, (req, res) => {
    const { title, url, description, rating } = req.body;
    if(!title) {
      logger.error('Title is required.');
      return res
        .status(400)
        .send('Invalid data');
    }
    if(!url) {
      logger.error('Url is required.');
      return res
        .status(400)
        .send('Invalid data');
    }
    if(!description) {
      logger.error('Description is required.');
      return res
        .status(400)
        .send('Invalid data');
    }
    if(!rating) {
      logger.error('Rating is required.');
      return res
        .status(400)
        .send('Invalid data');
    }
    const id = uuid();
    const bookmark = {
      id,
      title,
      url,
      description,
      rating
    };
    bookmarks.push(bookmark);
    logger.info(`Bookmark with id ${id} created.`);
    res
      .status(201)
      .location(`http://localhost:8000/bookmark/${id}`)
      .json(bookmark);
  })

bookmarksRouter
  .route('/bookmarks/:bookmark_id')
  .get((req, res, next) => {
    const { bookmark_id } = req.params
    BookmarksService.getById(req.app.get('db'), bookmark_id)
      .then(bookmark => {
        if (!bookmark) {
          // logger.error(`Bookmark with id ${bookmark_id} not found.`)
          return res.status(404).json({
            error: { message: `Bookmark Not Found` }
          })
        }
        res.json(bookmark)
      })
      .catch(next)
  })
  .delete((req, res) => {
    const { id } = req.params;
    const bookmarkIndex = bookmarks.findIndex(bmark => bmark.id == id);
    if(bookmarkIndex === -1) {
      logger.error(`Bookmark with id ${id} not found.`);
        return res
        .status(404)
        .send('Not Found')
    }
    bookmarks.splice(bookmarkIndex, 1);

    logger.info(`Bookmark with id ${id} deleted.`);
    res
      .status(204)
      .end();
  })

  module.exports = bookmarksRouter;