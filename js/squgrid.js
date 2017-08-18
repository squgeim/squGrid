(function() {
  var Util = (function() {
    var toggleClass = function(element, className) {
      var classList = element.classList;

      if (classList.contains(className)) {
        classList.remove(className);
      } else {
        classList.add(className);
      }
    };

    var addClass = function(element, className) {
      var classList = element.classList;
      classList.add(className);
    };

    var removeClass = function(element, className) {
      var classList = element.classList;
      classList.remove(className);
    };

    return {
      toggleClass: toggleClass,
      addClass: addClass,
      removeClass: removeClass
    };
  })();

  function dropTarget(elm) {
    var ELEMENT = elm;
    var dropCallbacks = [];

    var dragEnterHandler = function(event) {
      Util.addClass(ELEMENT, 'drag-active');
      event.preventDefault();
    };

    var dragOverHandler = function(event) {
      event.preventDefault();
    };

    var dragLeaveHandler = function(event) {
      Util.removeClass(ELEMENT, 'drag-active');
    };

    var dropHandler = function(event) {
      event.preventDefault();

      Util.removeClass(ELEMENT, 'drag-active');

      if (event.dataTransfer.files.length === 0) {
        return;
      }

      var file = event.dataTransfer.files[0];

      for (var callback of dropCallbacks) {
        if (typeof callback === 'function') {
          callback(file);
        }
      }
    };

    this.addDropCallback = function(callback) {
      if (typeof callback === 'function') {
        dropCallbacks.push(callback);
      }
    };

    ELEMENT.addEventListener('dragenter', dragEnterHandler);
    ELEMENT.addEventListener('dragover', dragOverHandler);
    ELEMENT.addEventListener('dragleave', dragLeaveHandler);
    ELEMENT.addEventListener('drop', dropHandler);
    this.element = ELEMENT;
  }

  function squGrid(squGridElem) {
    var introDivTarget;
    var introDiv;
    var canvasContainer;
    var canvas;
    var preferences;
    var currentFile;
    var prefManager;

    function PreferencesManager(elem) {
      var that = this;
      var ELEMENT = elem;

      this.numOfCols = 4;
      this.strokeColor = '#000000';

      var sendEvent = function() {
        var event = new Event('prefChange');
        ELEMENT.dispatchEvent(event);
      };

      var init = function() {
        var inputRow = document.createElement('div');

        var numOfColsLabel = document.createElement('label');
        numOfColsLabel.textContent = 'Num of columns';

        var numOfColsInput = document.createElement('input');
        numOfColsInput.type = 'number';
        numOfColsInput.min = 1;
        numOfColsInput.value = that.numOfCols;

        numOfColsInput.addEventListener('change', function(event) {
          that.numOfCols = Math.floor(event.target.value);

          if (that.numOfCols !== event.target.value) {
            event.target.value = that.numOfCols;
          }

          sendEvent();
        });

        numOfColsLabel.appendChild(numOfColsInput);

        var colorSelector = document.createElement('input');
        colorSelector.type = 'color';
        colorSelector.value = that.strokeColor;

        colorSelector.addEventListener('change', function(event) {
          that.strokeColor = event.target.value;

          sendEvent();
        });

        inputRow.appendChild(numOfColsLabel);
        inputRow.appendChild(colorSelector);

        var buttonsRow = document.createElement('div');

        var resetBtn = document.createElement('a');
        resetBtn.textContent = 'Reset';
        resetBtn.href = '';

        var downloadBtn = document.createElement('a');
        downloadBtn.textContent = 'Download';
        downloadBtn.href = '#';
        downloadBtn.addEventListener('click', function(event) {
          downloadBtn.href = canvas.toDataURL(currentFile.type);
          downloadBtn.download = 'squGrid_' + currentFile.name;
        });

        buttonsRow.appendChild(resetBtn);
        buttonsRow.appendChild(downloadBtn);

        ELEMENT.appendChild(inputRow);
        ELEMENT.appendChild(buttonsRow);
      };

      init();
    }

    var prepareDisplay = function() {
      introDiv.style.display = 'none';
      canvasContainer.style.display = 'block';
      preferences.style.display = 'block';
    };

    /**
    * handleFile
    *
    * @param file {File}
    * @returns {undefined}
    */
    var handleFile = function(file) {
      var fr = new FileReader();

      var numberOfColumns = prefManager.numOfCols;
      var color = prefManager.strokeColor;

      fr.addEventListener('load', function(event) {
        var url = event.target.result;
        var img = new Image();
        img.src = url;
        var width = img.width;
        var height = img.height;
        canvas.width = width;
        canvas.height = height;
        canvas.style.display = 'block';
        img.addEventListener('load', function(event) {
          var ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.drawImage(
            img,
            0,
            0,
            img.width,
            img.height,
            0,
            0,
            ctx.canvas.width,
            ctx.canvas.height
          );
          ctx.strokeStyle = color;

          addGridToContext(ctx, numberOfColumns);
        });
      });

      fr.readAsDataURL(file);
      // setUpCanvas();
    };

    var addGridToContext = function(ctx, numberOfColumns = 4, callback = null) {
      var gridWidth = parseFloat(ctx.canvas.width) / numberOfColumns;
      var height = parseFloat(ctx.canvas.height);
      var width = parseFloat(ctx.canvas.width);

      ctx.beginPath();

      var totalCol = numberOfColumns;
      for (var currentCol = 0; currentCol <= totalCol; currentCol++) {
        ctx.moveTo(gridWidth * (currentCol + 1), 0);
        ctx.lineTo(gridWidth * (currentCol + 1), height);
        ctx.stroke();
      }

      var totalRows = Math.floor(height / gridWidth);
      for (var currentRow = 0; currentRow < totalRows; currentRow++) {
        ctx.moveTo(0, gridWidth * (currentRow + 1));
        ctx.lineTo(width, gridWidth * (currentRow + 1));
        ctx.stroke();
      }

      if (typeof callback === 'function') {
        callback(ctx);
      }
    };

    this.__init__canvas = function() {
      canvasContainer = squGridElem.querySelector('.canvas-container');

      if (!canvas) {
        canvas = document.createElement('canvas');
        canvasContainer.appendChild(canvas);
      }
    };

    this.__init__preferences = function() {
      preferences = squGridElem.querySelector('.preferences');
      prefManager = new PreferencesManager(preferences);

      preferences.addEventListener('prefChange', function(event) {
        handleFile(currentFile);
      });
    };

    this.__init__dropTarget = function() {
      introDiv = squGridElem.querySelector('.intro');
      introDivTarget = new dropTarget(squGridElem);
      introDivTarget.addDropCallback(prepareDisplay);
      introDivTarget.addDropCallback(function(file) {
        currentFile = file;
        handleFile(file);
      });
    };

    for (method in this) {
      if (
        this.hasOwnProperty(method) &&
        typeof this[method] === 'function' &&
        method.indexOf('__init__') === 0
      ) {
        this[method]();
      }
    }
  }

  new squGrid(document.querySelector('.squGrid'));
})();
