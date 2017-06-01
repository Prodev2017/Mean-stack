'use strict';

var module = angular.module('docsx.drive', ['docsx.gapi']);

module.service('drive', ['$q', '$cacheFactory', 'googleApi', 'applicationId', '$http', function ($q, $cacheFactory, googleApi, applicationId, $http) {

  // Only fetch fields that we care about
  var DEFAULT_FIELDS = 'id,title,mimeType,userPermission,editable,copyable,shared,fileSize,parents,labels,thumbnailLink,iconLink,kind,alternateLink, thumbnail';

  var cache = $cacheFactory('files');

  /**
   * Combines metadata & content into a single object & caches the result
   *
   * @param {Object} metadata File metadata
   * @param {String} content File content
   * @return {Object} combined object
   */
  var combineAndStoreResults = function (metadata, content) {
    var file = {
      metadata: metadata,
      content: content
    };
    cache.put(metadata.id, file);
    return file;
  };

  this.saveDocServer = function (data) {
    data.token = gapi.auth.getToken().access_token;
    return $http.post('http://localhost:3000/document', data)
      .then(function (response) {
        return response;
      })
  };

  /**
   * Load a file from Drive. Fetches both the metadata & content in parallel.
   *
   * @param {String} fileID ID of the file to load
   * @return {Promise} promise that resolves to an object containing the file metadata & content
   */
  this.loadFile = function (fileId) {
    // var file = cache.get(fileId);
    // if (file) {
    //   return $q.when(file);
    // }
    return googleApi.then(function (gapi) {
      var metadataRequest = gapi.client.drive.files.get({
        fileId: fileId,
        fields: DEFAULT_FIELDS
      });
      var contentRequest = gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media'
      });
      return $q.all([$q.when(metadataRequest), $q.when(contentRequest)]);
    }).then(function (responses) {
      return combineAndStoreResults(responses[0].result, responses[1].body);
    });
  };

  /**
 * Get a file's metadata.
 *
 * @param {String} fileId ID of the file to print metadata for.
 */
  this.getFileLink = function (fileId) {

    return googleApi.then(function (gapi) {
      var request = gapi.client.drive.files.get({
        fileId: fileId
      });
      return $q.when(request);
    }).then(function (response) {
      return response.result;
    });

  };


  /**
    * Save a file to Drive using the mutlipart upload protocol.
    *
    * @param {Object} metadata File metadata to save
    * @param {String} content File content
    * @return {Promise} promise that resolves to an object containing the current file metadata & content
    */
  this.saveFile = function (metadata, content) {
    console.log('****');
    console.log(metadata);
    return googleApi.then(function (gapi) {
      var path;
      var method;

      if (metadata.id) {
        path = '/upload/drive/v2/files/' + encodeURIComponent(metadata.id);
        method = 'PUT';
      } else {
        path = '/upload/drive/v2/files';
        method = 'POST';
      }

      var multipart = new MultiPartBuilder()
        .append('application/json', JSON.stringify(metadata))
        .append(metadata.mimeType, content)
        .finish();

      var uploadRequest = gapi.client.request({
        path: path,
        method: method,
        params: {
          uploadType: 'multipart',
          fields: DEFAULT_FIELDS
        },
        headers: { 'Content-Type': multipart.type },
        body: multipart.body
      });
      return $q.when(uploadRequest);
    }).then(function (response) {
      return combineAndStoreResults(response.result, content);
    });
  };

  this.createNewFile = function (metadata) {

    return googleApi.then(function (gapi) {
      var path;
      var method;

      if (metadata.id) {
        path = '/upload/drive/v2/files/' + encodeURIComponent(metadata.id);
        method = 'PUT';
      } else {
        path = '/upload/drive/v2/files';
        method = 'POST';
      }

      var multipart = new MultiPartBuilder()
        .append('application/json', JSON.stringify(metadata))
        .append(metadata.mimeType)
        .finish();

      var uploadRequest = gapi.client.request({
        path: path,
        method: method,
        params: {
          uploadType: 'multipart',
          convert: true,
          fields: DEFAULT_FIELDS
        },
        headers: { 'Content-Type': multipart.type },
        body: multipart.body
      });
      return $q.when(uploadRequest);
    }).then(function (response) {
      return response;
    });
  }

  /**
   * Displays the Drive file picker configured for selecting text files
   *
   * @return {Promise} Promise that resolves with the ID of the selected file 
   */
  this.showPicker = function (folders, docsx) {
    return googleApi.then(function (gapi) {
      var deferred = $q.defer();
      var feature;
      if (folders) {
        var view = new google.picker.DocsView(google.picker.ViewId.FOLDERS);
        view.setSelectFolderEnabled(true);
        view.setIncludeFolders(true);
        view.setMimeTypes('application/vnd.google-apps.folder');
      }
      else if (docsx) {
        var view = new google.picker.DocsView(google.picker.ViewId.DOCS);
        view.setMimeTypes("application/vnd.docsx.ext-type.docsx");
      } else {
        var view = new google.picker.DocsView(google.picker.ViewId.DOCS);
        feature = google.picker.Feature.MULTISELECT_ENABLED;
        view.setMimeTypes('application/vnd.google-apps.document,application/vnd.google-apps.spreadsheet,application/vnd.google-apps.presentation,application/vnd.google-apps.drawing,application/vnd.google-apps.form');
      }

      var picker = new google.picker.PickerBuilder()
        .setAppId(applicationId)
        .setOAuthToken(gapi.auth.getToken().access_token)
        .addView(view)
        .enableFeature(feature)
        .setCallback(function (data) {
          if (data.action == 'picked') {
            if (!docsx && !folders) {
              console.log('dsfreyrtyrtdfs');
              var documents = data.docs;
              deferred.resolve(documents);
            } else {
              var id = data.docs[0].id;
              deferred.resolve(id);
            }

          } else if (data.action == 'cancel') {
            deferred.reject();
          }
        })
        .build();
      picker.setVisible(true);
      return deferred.promise;

    });
  };



  /**
   * Displays the Drive sharing dialog
   *
   * @param {String} id ID of the file to share
   */
  this.showSharing = function (id) {
    return googleApi.then(function (gapi) {
      //var deferred = $q.defer();
      var share = new gapi.drive.share.ShareClient();
      share.setOAuthToken(gapi.auth.getToken().access_token);
      share.setItemIds([id]);

      share.showSettingsDialog();
      //return deferred.promise;
    });
  };


  /**
 * Insert a file into a folder.
 *
 * @param {String} folderId ID of the folder to insert the file into.
 * @param {String} fileId ID of the file to insert.
 */
  this.insertFileIntoFolder = function (folderId, fileId, removeParents) {

    return googleApi.then(function (gapi) {
      // var body = { 'id': folderId };
      var body = { 'title': '' };
      var request = gapi.client.drive.files.patch({
        'fileId': fileId,
        'addParents': folderId,
        'removeParents': removeParents,
        'resource': body
      });

      return $q.when(request);
    }).then(function (response) {
      return response.result;
    });

  };

  /**
 * trash a file.
 *
 * @param {String} fileId ID of the file to trash.
 */
  this.deleteFile = function (fileId) {
    return googleApi.then(function (gapi) {
      var request = gapi.client.drive.files.trash({
        'fileId': fileId
      });
      return $q.when(request);
    }).then(function (response) {
      return response;
    });
  }

  this.copyFile = function (fileId, title) {
    return googleApi.then(function (gapi) {
      var body = {'title': title};
      var request = gapi.client.drive.files.copy({
        'fileId': fileId,
        'resource': body
      });
      return $q.when(request);
    }).then(function (response) {
      return response;
    });
  }

}]);
