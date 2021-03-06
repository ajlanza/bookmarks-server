const express = require ('express');
const bookmarksRouter = express.Router();
const bodyParser = express.json();
const { bookmarks } = require('../store');
const logger = require('../logger');
const { v4: uuid } = require('uuid');

bookmarksRouter
  .route('/bookmarks')
  .get((req,res) => {
    res.json(bookmarks);
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
      .location(`http://localhost:8000/bookark/${id}`)
      .json(bookmark);
  })

bookmarksRouter
  .route('/bookmarks/:id')
  .get((req,res) => {
    const { id } = req.params;
    const bookmark = bookmarks.find(bmark => bmark.id == id);
    if(!bookmark){
      logger.error(`Bookmark with id ${id} not found.`);
      res
        .status(404)
        .send('Not Found');
    }
    res
      .json(bookmark);
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