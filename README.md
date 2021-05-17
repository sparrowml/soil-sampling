# Soil Sampling

A user-friendly application for selecting soil sampling locations using geophysical data layers.

## Pre-requisites

* Install [Docker Desktop](https://docs.docker.com/get-docker/) to run the app.


## Run the app locally

From the root directory of the project, run the following:
```
$ docker-compose up --build
```

## Development

For developing the app, you will also need to install:

* [VS Code](https://code.visualstudio.com/download)
* The [Remote Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension

Once these are installed:

1. Open the project in VS Code
2. Open the Command Palette with `F1`
3. Start type "Remote Containers" and select the command to build the container
4. This will run the React development server and drop you inside the Python container. Start the Flask development server with `F5`.
5. From your host machine, you can see the Flask server at `http://localhost:9000/` and the React app at `http://localhost:3000/`.

