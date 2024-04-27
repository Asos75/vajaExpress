var PhotoModel = require('../models/photoModel.js');
const fs = require('fs');
/**
 * photoController.js
 *
 * @description :: Server-side logic for managing photos.
 */
module.exports = {

    /**
     * photoController.list()
     */
    list: function (req, res) {
        PhotoModel.find()
        .populate('postedBy')
        .exec(function (err, photos) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting photo.',
                    error: err
                });
            }
            var data = [];
            data.photos = photos;
            return res.render('photo/list', data);
        });
    },

    /**
     * photoController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        PhotoModel.findOne({_id: id}, function (err, photo) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting photo.',
                    error: err
                });
            }

            if (!photo) {
                return res.status(404).json({
                    message: 'No such photo'
                });
            }

            return res.json(photo);
        });
    },

    /**
     * photoController.create()
     */
    create: function(req, res) {
        PhotoModel.findOneAndDelete({ postedBy: req.session.userId }, function(err, deletedPhoto) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting existing photo',
                    error: err
                });
            }
    
            // If a photo was found and deleted, unlink its file
            if (deletedPhoto) {
                fs.unlink(deletedPhoto.path, (err) => {
                    if (err) {
                        // Handle specific error if any
                        if (err.code === 'ENOENT') {
                            console.error('File does not exist.');
                        } else {
                            console.error('Error when deleting file:', err);
                        }
                    } else {
                        console.log('File deleted!');
                    }
                });
            }
    
            // Create a new photo
            var photo = new PhotoModel({
                path: "/images/" + req.file.filename,
                postedBy: req.session.userId,
            });
    
            // Save the new photo
            photo.save(function(err, savedPhoto) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when creating photo',
                        error: err
                    });
                }
    
                // Redirect to the photos page
                return res.redirect('/');
            });
        });
    },
    
    /**
     * photoController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        PhotoModel.findOne({_id: id}, function (err, photo) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting photo',
                    error: err
                });
            }

            if (!photo) {
                return res.status(404).json({
                    message: 'No such photo'
                });
            }

            photo.name = req.body.name ? req.body.name : photo.name;
			photo.path = req.body.path ? req.body.path : photo.path;
			photo.postedBy = req.body.postedBy ? req.body.postedBy : photo.postedBy;
			photo.views = req.body.views ? req.body.views : photo.views;
			photo.likes = req.body.likes ? req.body.likes : photo.likes;
			
            photo.save(function (err, photo) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating photo.',
                        error: err
                    });
                }

                return res.json(photo);
            });
        });
    },

    /**
     * photoController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        PhotoModel.findByIdAndRemove(id, function (err, photo) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the photo.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    },

    publish: function(req, res){
        return res.render('photo/publish');
    }
};
