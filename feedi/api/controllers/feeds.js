const feedParser = require('feedparser-promised');
const mongoose = require('mongoose');
const util = require('util');

const config = require.main.require('./config');
const Feed = require.main.require('./api/models/feed');
const Entry = require.main.require('./api/models/entry');

exports.feeds_get_all = (req, res, next) => {
  const user = req.query.user;

  if(!user){
    return res.status(400).json({ message: "Client Error" });
  }

  Feed.find({user: user})
    //.select('name version discoveredAt')
    //.populate('entry', '_id')
    .exec()
    .then(feeds => {

      Entry
        .aggregate([
          { "$group": { _id: "$feed", count: { $sum: 1 } } },
          { $sort: { "_id.feed": 1 } }
        ])
        .exec()
        .then(feedCounts => {

          //console.log(feeds, feedCounts);
          const response = {
            count: feeds.length,
            feeds: feeds.map(feed => {

              // console.log(feedCounts);
              // const obj = feedCounts.find(x => x._id.toString() == feed._id.toString());
              // console.log(obj.count);

              return {
                name: feed.name,
                discoveredAt: feed.discoveredAt,
                type: feed.type,
                version: feed.version,
                title: feed.title,
                link: feed.link,
                updated: feed.updated,
                published: feed.published,
                discovered: feed.discovered,
                retrieved: feed.retrieved,
                noOfEntries: feedCounts.find(x => mongoose.Types.ObjectId(x._id).equals(mongoose.Types.ObjectId(feed._id))).count,
                _id: feed._id,
                request: {
                  type: 'GET',
                  url: util.format("%s/feeds/%s", config.baseUrl(), feed._id)
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

        
    });
}

exports.feeds_create_feed = (req, res, next) => {
  const user = req.query.user;

  if (!user) {
    return res.status(400).json({ message: "Client Error" });
  }

  Feed.findOne({ discoveredAt: req.body.link, user: user })
    .exec()
    .then(feed => {
      if (feed) {
        return res.status(200).json({
          status: 'error',
          message: 'Feed already exists'
        });
      } else {

        const httpOptions = {
          uri: req.body.link,
          timeout: 3000,
          gzip: true
        };

        const feedParserOptions = {
          feedurl: req.body.link,
          normalize: true,
          addmeta: true,
          resume_saxerror: true
        };

        feedParser
          .parse(httpOptions, feedParserOptions)
          .then(items => {
            const feed = new Feed({
              name: req.body.name,
              discoveredAt: req.body.link,
              type: items[0].meta["#type"],
              version: items[0].meta["#version"],
              title: items[0].meta.title,
              link: items[0].meta.link,
              updated: items[0].meta.date,
              published: items[0].meta.pubDate,
              discovered: new Date(),
              retrieved: new Date(),
              user: user,
              _id: new mongoose.Types.ObjectId()
            });

            feed
              .save()
              .then(result => {

                //Addding entrys
                items.forEach(item => {
                  const entry = new Entry({
                    title: item.title,
                    link: item.link,
                    updated: item.date,
                    published: item.pubDate,
                    discovered: new Date(),
                    retrieved: new Date(),
                    isFavourite: false,
                    isRead: false,
                    feed: feed._id,
                    _id: new mongoose.Types.ObjectId()
                  });

                  entry
                    .save()
                    .then(entryResult => {
                      console.log(entryResult);

                    }).catch(err => {
                      console.log("4", err);
                      res.status(500).json({
                        error: err
                      });
                    });
                });


                console.log(result);
                res.status(201).json({
                  status: 'success',
                  message: 'Feed added successfully',
                  createdFeed: {
                    name: result.name,
                    discoveredAt: result.discoveredAt,
                    type: result.type,
                    version: result.version,
                    title: result.title,
                    link: result.link,
                    updated: result.updated,
                    published: result.published,
                    discovered: result.discovered,
                    retrieved: result.retrieved,
                    _id: result._id,
                    request: {
                      type: 'GET',
                      url: util.format("%s/feeds/%s", config.baseUrl(), result._id)
                    }
                  }
                });
              }).catch(err => {
                console.log("2", err);
                res.status(500).json({
                  error: err
                });
              });
          }).catch(err => {
            console.log("1", err);
            res.status(500).json({
              error: err
            });
          });
      }
    }).catch(err => {
      console.log("3", err);
      res.status(500).json({
        error: err
      });
    });
}

exports.feeds_update_feed = (req, res, next) => {
  const feedId = req.params.feedId;
  //Checking upadate request within 10 minutes or not
  Feed.findOne({ _id: feedId })
    .exec()
    .then(feed => {
      if (new Date() - new Date(feed.retrieved) < 10 * 60 * 1000) {
        return res.status(429).json({ message: 'You can update feed in every 10 minutes' });
      } else {
        Entry.find({ feed: feedId })
          .populate('feed', 'discoveredAt')
          .exec()
          .then(entries => {
            //console.log(entries);
            // res.status(200).json(entries);
            // return;
            feedParser
              .parse({
                uri: entries[0].feed.discoveredAt,
                timeout: 3000,
                gzip: true
              })
              .then(items => {

                items.forEach(item => {
                  const entry = entries.find(x => (x.link == item.link) || (x.title == item.title));
                  if (entry) {
                    //Updating Exisiting Entry
                    const updateOps = {
                      title: item.title,
                      link: item.link,
                      updated: item.date,
                      published: item.pubDate,
                      //discovered: entry.discovered,
                      retrieved: new Date(),
                      //isFavourite: entry.isFavourite,
                      isRead: new Date(item.date) > new Date(entry.updated) ? false : entry.isRead
                      //feed: req.params.feedId                
                    }

                    Entry.update({ _id: entry._id }, { $set: updateOps })
                      .exec()
                      .then(entryUpdateResult => {
                        console.log(entryUpdateResult);
                      })
                      .catch(err => { res.status(500).json({ message: 'existing update failed', error: err }); });


                  } else {
                    //Adding New Entry
                    const newEntry = new Entry({
                      title: item.title,
                      link: item.link,
                      updated: item.date,
                      published: item.pubDate,
                      discovered: new Date(),
                      retrieved: new Date(),
                      isFavourite: false,
                      isRead: false,
                      feed: req.params.feedId,
                      _id: new mongoose.Types.ObjectId()
                    });

                    newEntry
                      .save()
                      .then(entryAddResult => {
                        console.log(entryAddResult);
                      })
                      .catch(err => { res.status(500).json({ message: 'new entry add failed', error: err }); });
                  }

                });

                Feed.update({ _id: feedId }, { $set: { retrieved: new Date() } })
                  .exec()
                  .then(feedUpdateResult => {
                    console.log(feedUpdateResult);
                    res.status(200).json({ message: 'Feed Updated' });
                  })
                  .catch(err => { res.status(500).json({ message: 'feed update failed', error: err }); });


                  const date = new Date();
                  date.setDate(date.getDate()-30);

                  Entry.deleteMany({updated: { $lt: date }})
                  .exec()
                  .then(rs => {
                    console.log(rs);                    
                  })
                  .catch(err => { res.status(500).json({ message: 'entry remove old failed', error: err }); });
              })
              .catch(err => { res.status(500).json({ message: 'parse failed', error: err }); });
          })
          .catch(err => { res.status(500).json({ message: 'feed not found', error: err }); });
      }

    })
    .catch(err => { res.status(500).json({ message: 'Failed to fetch feed', error: err }); });
}

exports.feeds_delete_feed = (req, res, next) => {
  Entry.remove({ feed: req.params.feedId })
    .exec()
    .then(entryResult => {
      Feed.remove({ _id: req.params.feedId })
        .exec()
        .then(result => {
          console.log(result);
          res.status(200).json({
            message: 'Feed deleted successfully',
            request: {
              type: 'POST',
              url: util.format("%s/feeds/", config.baseUrl()),
              body: { name: 'String', link: 'String' }
            }
          });
        })
    }).catch(err => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
}
