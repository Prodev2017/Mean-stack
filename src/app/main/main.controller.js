'use strict';

var module = angular.module('docsx');


module.controller('MainCtrl', ['$scope', '$location', '$routeParams', '$q', '$mdToast', 'drive', 'login', 'renameDialog', 'deleteDialog', '$sce', '$timeout', '$http', 'thumbnail', 'urlDialog', function ($scope, $location, $routeParams, $q, $mdToast, drive, login, renameDialog, deleteDialog, $sce, $timeout, $http, thumbnail, urlDialog) {
    var DEFAULT_FILE = {
        content: '',
        metadata: {
            id: null,
            title: 'untitled',
            mimeType: 'application/vnd.docsx.ext-type.docsx',
            fileExtension: 'docsx',
            editable: true,
            iconLink: 'http://docsx.proffibit.com/favicon-16x16.png',
            thumbnailLink: 'http://docsx.proffibit.com/app/assets/images/thumb.png',
            "thumbnail": {
                "image": thumbnail.baseImg(),
                "mimeType": 'image/png'
            }

        }
    };

    $scope.file = null;
    $scope.loading = true;

    $scope.documents = [];

    // $scope.selectedTab = 0;

    // drag
    $scope.dragControlListeners = {
        accept: function (sourceItemHandleScope, destSortableScope) { return boolean },
        itemMoved: function (event) {
        },
        orderChanged: function (event) {
        },
        containment: '#board',
        clone: true,
        allowDuplicates: false
    };



    /**
     * Displays a short message as a toast
     *
     * @param {String} message Message to display
     */
    var showMessage = function (message) {
        $mdToast.show($mdToast.simple().content(message).position('bottom right'));
    };

    // add document to tab
    var addDoc = function (doc) {
        var document = {
            id: doc.id,
            name: doc.name,
            url: doc.url,
            iconUrl: doc.iconUrl,
            thumbnailLink: doc.iconUrl
        };
        if(doc.type){
            document.type = doc.type;
        }
        var consist = false;
        if ($scope.documents.length > 0) {

            for (var i = 0; i < $scope.documents.length; i++) {

                if (document.id === $scope.documents[i].id) {
                    consist = true;
                    break;
                } else {
                    consist = false;
                }
            }

            if (!consist) {
                $scope.documents.push(document);
            } else {
                console.log(document.name)
                $timeout(function () {
                    showMessage(document.name + ' already exist in DocsX');
                })
            }
        } else {
            $scope.documents.push(document);
        }

    };

    /**
     * Internal helper to saves the current file. If the file is new, redirects to the correct URL once complete.
     *
     * @return {Promise} promise that resolves once the save is complete
     */
    var save = function () {
        $scope.saveMessage = 'Saving...';
        return drive.saveFile($scope.file.metadata, angular.toJson($scope.documents)).then(function (result) {
            redirectIfChanged(result.metadata.id);
            $scope.file = result;
            // showMessage('File saved');
            $scope.saveMessage = 'All changes saved in DocsX'
            return $scope.file;
        }, function (err) {
            // showMessage('Unable to save file');
            $scope.saveMessage = 'Unable to save file'
            return $q.reject(err);
        }).then(function (file) {
            drive.saveDocServer(file);
        });
    };

    this.createNew = function (type) {
        var metadata = {};
        switch (type) {
            case 'document':
                metadata.mimeType = 'application/vnd.oasis.opendocument.text';
                break;
            case 'sheet':
                metadata.mimeType = 'text/csv';
                break;
        }

        if (type === 'document' || type === 'sheet') {
            metadata.title = 'Untitled Document';
            metadata.convert = 'true';
            drive.createNewFile(metadata).then(function (response) {
                console.log(response.result);
                var newDoc = {
                    id: response.result.id,
                    name: response.result.title,
                    url: response.result.alternateLink,
                    iconUrl: response.result.iconLink
                }
                addDoc(newDoc);
                console.log($scope.documents);
            });
        }
        if (type === 'drawing') {
            drive.copyFile('1qau4BU2zNmzRM4AiYx0B5zxDLSFzslRq3cqg3RK5cH0', 'untitled_draw').then(function (response) {
                console.log(response);
                var document = {
                    id: response.result.id,
                    name: response.result.title,
                    url: response.result.alternateLink,
                    iconUrl: response.result.iconLink,
                    thumbnailLink: response.result.iconLink
                };
                addDoc(document);
            })
        }
        if (type === 'form') {
            drive.copyFile('1ekJ14h0bBa5rQ9_SG6A9Zu2duks2WddAEeXRl85e9r4', 'untitled_form').then(function (response) {
                console.log(response);
                var document = {
                    id: response.result.id,
                    name: response.result.title,
                    url: response.result.embedLink,
                    iconUrl: response.result.iconLink,
                    thumbnailLink: response.result.iconLink,
                    type: 'form'
                };
                addDoc(document);
            })
        }
        if (type === 'docsx') {
            drive.copyFile('0B0CS4grdRK1CQUJJQUhPV2dRWEk', 'untitled_docsx').then(function (response) {
                console.log(response);
                var document = {
                    id: response.result.id,
                    name: response.result.title,
                    url: 'http://www.docsx.com/#/edit/' + response.result.id,
                    iconUrl: 'http://www.docsx.com/favicon-16x16.png',
                    thumbnailLink: response.result.iconLink,
                    type: 'docsx'
                };
                addDoc(document);
            })
        }
    }

    /**
     * Internal helper to load a file. If no ID given or unable to read the specified file, a blank template
     * is loaded.
     *
     * @param {String} fileId ID of the file to load
     * @return {Promise} promise that resolves once the file is loaded
     */
    var load = function (fileId) {
        var filePromise = fileId ? drive.loadFile(fileId) : $q.when(DEFAULT_FILE);
        return filePromise.then(function (file) {
            console.log(file);
            $scope.file = file;
            $scope.file.metadata.fileExtension = DEFAULT_FILE.metadata.fileExtension;
            $scope.file.metadata.thumbnailLink = DEFAULT_FILE.metadata.thumbnailLink;
            $scope.file.metadata.iconLink = DEFAULT_FILE.metadata.thumbnailLink;
            $scope.file.metadata.contentHints = DEFAULT_FILE.metadata.contentHints;
            return $scope.file;
        }, function (err) {
            if (fileId) {
                showMessage('Unable to load file');
            }
            return load();
        }).then(function (file) {
            if (file && file.content.length) {
                console.log($scope.file);
                var content = JSON.parse(file.content);
                for (var i = 0; i < content.length; i++) {
                    addDoc(content[i]);
                }
                $scope.selectedTab = getLastTab();
                setFolderIconInIframe($scope.documents[$scope.selectedTab - 1].name);
            }
        });
    };

    /**
     * Check to see if the URL should be changed (new doc ID), redirects
     * to the new URL if so.
     *
     * @param {String} id Document ID
     */
    var redirectIfChanged = function (id) {
        if ($scope.file.metadata.id != id) {
            $location.path('/edit/' + id);
            $location.search('');
            $location.replace();
        }
    };



    // /**
    //  * Handles the save button click for user-initiated saves. If saving a new file,
    //  * first prompts to rename the file.
    //  *
    //  * @param {Event} $event Original click event
    //  */
    // this.saveFile = function ($event) {
    //   if ($scope.file.metadata.id === null) {
    //     return this.renameFile($event);
    //   } else {
    //     return save();
    //   }
    // };


    this.renameAndSave = function () {
        save();
    }



    var deleteFile = function (id, title, docsxType) {
        return drive.deleteFile(id).then(function (response) {
            if (response.result) {
                showMessage(title + ' moved to Google Drive trash');
                if (docsxType) {
                    redirectIfChanged('');
                }
            } else {
                console.log(response);
            }
        });
    };

    /**
     * Handles the title/rename click. Saves the file immediately on rename.
     *
     * @param {Event} $event Original click event
     */
    this.renameFile = function ($event) {
        return renameDialog.show($event, $scope.file.metadata.title).then(function (title) {
            $scope.file.metadata.title = title;
            return save();
        });
    };


    this.addUrl = function ($event) {
        return urlDialog.show($event, '').then(function (url) {
            console.log(url)
            var document = {
                id: url,
                name: url,
                url: url
            };
            addDoc(document);
            console.log($scope.documents)
            // $scope.file.metadata.title = title;
            return save();
        });

    };


    this.deleteDocument = function ($event) {
        return deleteDialog.show($event, '', 'Delete DocsX', 'Warning this will delete this DocsX from your Google Drive', 'The linked documents will not the deleted only the DocsX files will be deleted.').then(function (title) {
            return deleteFile($scope.file.metadata.id, $scope.file.metadata.title, true);
        });
    };

    this.moveToTrash = function (index, $event) {
        console.log($scope.documents[index]);
        deleteDialog.show($event, '', 'Delete File', 'Are you sure you wish to continue?')
            .then(function (title) {
                deleteFile($scope.documents[index].id, $scope.documents[index].name);
            })
            .then(function () {
                $scope.documents.splice(index, 1);
                save();
            });

    };

    this.addStar = function (event) {
        $scope.file.metadata.labels.starred = !$scope.file.metadata.labels.starred;
        console.log($scope.file);
        if ($scope.file.metadata.labels.starred) {
            showMessage($scope.file.metadata.title + ' has been starred.');
        } else {
            showMessage($scope.file.metadata.title + ' has been unstarred.');
        }

        save();
    }

    /**
     * Handle the open file click. Displays the Drive file picker and opens
     * the selected document.
     */
    this.openFile = function ($event) {
        drive.showPicker().then(function (documents) {
            // drive.getFileLink(id).then(function (response) {
            console.log(documents);
            for (var i = 0; i < documents.length; i++) {
                addDoc(documents[i]);
                // showMessage(documents[i].name + ' added');
            }
            save();

            // });
        });
    };

    this.openDocsx = function ($event) {
        drive.showPicker(false, true).then(function (id) {
            redirectIfChanged(id);
        });
    };

    function getLastTab() {
        var lastTab;
        if (localStorage.lastTab) {
            lastTab = localStorage.lastTab;
        }
        else {
            lastTab = 0;
        }
        return lastTab;
    }

    this.tabOpen = function (index) {
        $scope.selectedTab = index + 1;
        localStorage.lastTab = index + 1;
        console.log($scope.documents[$scope.selectedTab - 1].type)
        setFolderIconInIframe($scope.documents[$scope.selectedTab - 1].name);

    }

    function setFolderIconInIframe(name) {
        $timeout(function () {
            $scope.iframeDocumentName = name;
            $scope.$apply();
            return $scope.iconPositionLeft = document.getElementById('inpWidth').offsetWidth + 101;
        }, 50)
    }


    /**
     * Handle the open file click. Displays the Drive file picker and opens
     * the selected document.
     */
    this.moveToFolder = function ($event) {
        drive.showPicker(true).then(function (id) {
            drive.getFileLink(id).then(function (response) {
                var folderId = response.id;
                drive.insertFileIntoFolder(folderId, $scope.file.metadata.id, $scope.file.metadata.parents[0].id).then(function (result) {
                    showMessage('Document moved to folder:' + response.title);
                });
            });
        });
    };

    this.moveDocumentToFolder = function ($event) {
        drive.showPicker(true).then(function (id) {
            drive.getFileLink(id).then(function (response) {
                var folderId = response.id;
                drive.getFileLink($scope.documents[$scope.selectedTab - 1].id).then(function (result) {
                    console.log(result);
                    drive.insertFileIntoFolder(folderId, result.id, result.parents[0].id).then(function (result) {
                        showMessage($scope.documents[$scope.selectedTab - 1].name + ' moved to folder:' + result.title);
                    });
                })

            });
        });
    };


    this.removeFromDocsx = function (index) {
        $scope.documents.splice(index, 1);
        save();
    }


    /**
     * Handle the share click. Displays the Drive sharing dialog.
     */
    this.shareFile = function ($event) {
        if ($scope.file.metadata.id === null) {
            $scope.ctrl.renameFile($event).then(function () {
                drive.showSharing($scope.file.metadata.id);
            });
        } else {
            drive.showSharing($scope.file.metadata.id);
        }
    };

    this.shareDocument = function ($event) {
        if ($scope.documents[$scope.selectedTab - 1].id !== $scope.documents[$scope.selectedTab - 1].name) {
            drive.showSharing($scope.documents[$scope.selectedTab - 1].id);
        }
    }



    // Authenticate & load doc
    var loadFn = angular.bind($scope.ctrl, load, $routeParams.fileId);
    login.checkAuth($routeParams.user).then(loadFn, function () {
        return login.showLoginDialog(null, $routeParams.user).then(loadFn);
    }).then(function () {
        login.userInfo().then(function (response) {
            $scope.user = {};
            $scope.user.name = response.data.name;
            $scope.user.email = response.data.email;
            $scope.user.picture = response.data.picture;
        })
    }).finally(function () {
        $scope.loading = false;
        $timeout(function () {
            namesSync();
        }, 2000)
    });

    function namesSync() {
        setInterval(function () {
            if ($scope.documents.length > 0) {
                for (let i = 0; i < $scope.documents.length; i++) {
                    if ($scope.documents[i].id !== $scope.documents[i].name) {
                        drive.getFileLink($scope.documents[i].id).then(function (result) {
                            if ($scope.documents[i].name !== result.title) {
                                $scope.documents[i].name = result.title;
                            }
                        });
                    }
                }
            }
        }, 4000);
    };

}]);
