'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Order Schema
 */
var DocumentSchema = new Schema({
  metadata: [Schema.Types.Mixed],
  content: [Schema.Types.Mixed],
  created: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('Document', DocumentSchema);