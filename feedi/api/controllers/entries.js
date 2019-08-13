const feedParser = require('feedparser-promised');
const mongoose = require('mongoose');
const util = require('util');

const config = require.main.require('./config');
const Feed = require.main.require('./api/models/feed');
const Entry = require.main.require('./api/models/entry');

exports.entries_get_all = (req, res, next) => {
  const user = req.query.user;
  const isRead = req.query.read;
  const isFavourite = req.query.starred;

  if (!user) {
    return res.status(400).json({ message: "Client Error" });
  }   

  Feed.find({ user: user })
    .exec()
    .then(feeds => {
      const feedIds = [];
      feeds.forEach((feed, index) => {
        feedIds[index] = feed._id
      });

      //console.log(feedIds);

      let filterObj = { feed: { $in : feedIds } }
      if(isRead)
          filterObj.isRead = isRead;
      if(isFavourite)
          filterObj.isFavourite = isFavourite;
      
      
      Entry.find(filterObj)
        //.select('name price _id productImage')
        .populate('feed', 'name')
        .exec()
        .then(docs => {
          //console.log(docs);
          const response = {
            count: docs.length,
            entries: docs.map(doc => {
              return {
                feed: doc.feed,
                title: doc.title,
                link: doc.link,
                updated: doc.updated,
                published: doc.published,
                discovered: doc.discovered,
                retrieved: doc.retrieved,
                isFavourite: doc.isFavourite,
                isRead: doc.isRead,
                _id: doc._id,
                request: {
                  type: 'GET',
                  url: util.format("%s/entries/%s", config.baseUrl(), doc._id)
                }
              }
            })
          };
          res.status(200).json(response);
        })
        .catch(err => { res.status(500).json({ message: 'entry not found', error: err }); });

    })
    .catch(err => { res.status(500).json({ message: 'feed not found', error: err }); });

}

exports.entries_get_entries_by_feed = (req, res, next) => {


  Entry.find({ feed: req.params.feedId })
    //.select('name price _id productImage')
    .populate('feed', 'name')
    .exec()
    .then(docs => {
      console.log(docs);
      const response = {
        count: docs.length,
        entries: docs.map(doc => {
          return {
            feed: doc.feed,
            title: doc.title,
            link: doc.link,
            updated: doc.updated,
            published: doc.published,
            discovered: doc.discovered,
            retrieved: doc.retrieved,
            isFavourite: doc.isFavourite,
            isRead: doc.isRead,
            _id: doc._id,
            request: {
              type: 'GET',
              url: util.format("%s/entries/%s", config.baseUrl(), doc._id)
            }
          }
        })
      };
      res.status(200).json(response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
}

exports.entries_update_entry = (req, res, next) => {
  const id = req.params.entryId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Entry.update({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      console.log(result);
      res.status(200).json({
        status: 'success',
        message: 'Entry updated',
        request: {
          type: 'GET',
          url: util.format("%s/entries/%s", config.baseUrl(), id)
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
}