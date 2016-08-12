## State Example:


```javascript
state = {
  layout: {
  },
  editor: {
    
  }
  editor: {
    "metadata" : {
      "signature": "hex-digest", # used for authenticating unsafe outputs on load
      "kernel_info": {
          # if kernel_info is defined, its name field is required.
          "name" : "the name of the kernel"
      },
      "language_info": {
          # if language_info is defined, its name field is required.
          "name" : "the programming language of the kernel",
          "version": "the version of the language",
          "codemirror_mode": "The name of the codemirror mode to use [optional]"
      }
    },
    "nbformat": 4,
    "nbformat_minor": 0,
    cells: [
      {
        "cell_type" : "markdown",
        "metadata" : {
          "collapsed" : True, // whether the output of the cell is collapsed
          "autoscroll": False, // any of true, false or "auto"
        },
        "source":  "single string or [list, of, strings]",
        "outputs": [
          {
              // list of output dicts (described below)
              // "output_type": "stream",
              // ...
          },
            {
              "output_type" : "display_data",
              "data" : {
                "text/plain" : ["multiline text data"],
                "image/png": ["base64-encoded-png-data"],
                "application/json": {
                  # JSON data is included as-is
                  "json": "data",
                },
              },
              "metadata" : {
                "image/png": {
                  "width": 640,
                  "height": 480,
                },
              },
            },
            {
              "output_type" : "execute_result",
              "execution_count": 42,
              "data" : {
                "text/plain" : ["multiline text data"],
                "image/png": ["base64-encoded-png-data"],
                "application/json": {
                  # JSON data is included as-is
                  "json": "data",
                },
              },
              "metadata" : {
                "image/png": {
                  "width": 640,
                  "height": 480,
                },
              },
            },
            // type: "error"
            {
              'ename' : str,   # Exception name, as a string
              'evalue' : str,  # Exception value, as a string
            
              # The traceback will contain a list of frames,
              # represented each as a string.
              'traceback' : list,
            }
          ]
        },
        {
          "cell_type" : "raw",
          "metadata" : {
            # the mime-type of the target nbconvert format.
            # nbconvert to formats other than this will exclude this cell.
            "format" : "mime/type"
          },
          "source" : ["some nbformat mime-type data"]
        }
      ]
    }
  }
```
