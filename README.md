# URI Internal Netmap

This application provides an interactive view of the health of the University's network.

To make any changes to the code, clone this repository to your local device. When you are finished, rebuild the files (if necessary) and copy them--likely over SSH--to the appropriate directories on the web server, listed below.

## Frontend

The client application displays each of the nodes tracked by the service and the relevant IP SLA statistics linking them.
The color of these connecting lines corresponds to the health of the links (green = normal, red = disrupted).
Clicking on a link displays detailed statistics.
The map is built on an interactive canvas that can be zoomed and panned.

### Technical information

The app is made with the JavaScript React framework. It incorporates the React Flow library to assemble and display the map. It also makes use of Vite as a build tool.

The file structure is as follows:

- `src/`: the source code of the app
- `public/`: configuration files used by the Apache web server
- `dist/`: the compiled files that are ready to be served to the user
- `node_modules/`: libraries installed by the package manager
- Various config files that alter the build process of the app

### Testing

1. `cd` to the `client` directory
1. Ensure that you have `npm` installed on your system
1. Run `npm i` to install the necessary dependencies (as specified in `package.json`)
1. Run `npm run dev` to start the development server (**not** to be used for production!)

### Building

1. Repeat steps 1-3 above
2. Run `npm run build` to compile the project down to plain HTML/CSS/JS
3. Copy the resulting files to `/srv/netmap/frontend/` and, if necessary, reload the Apache server

The Apache server serves the frontend from the root of the web server, or `http://10.10.96.234/`.

## Backend

The backend exposes an API that allows the client to access the database indirectly, a best practice for security.
There is also a monitoring script that regularly scans each node for updated statistics and loads the information into the database.

### Accessing the database

The database can be accessed via the `mongosh netmap` (MongoDB shell) command.
MongoDB is a NoSQL database but still supports standard operations using a "method-call" syntax.
The output it returns is formatted as BSON, an extended variant of JSON (JavaScript Object Notation).

- Read: `db.<collection>.find( [filter] );`
- Create: `db.<collection>.insertOne({...});` or `db.<collection>.insertMany([...]);`
- Update: `db.<collection>.updateOne({...});` or `db.<collection>.updateMany([...]);`
- Delete: `db.<collection>.deleteOne({...});` or `db.<collection>.deleteMany([...]);`

Replace `<collection>` with the name of the collection you want to operate on (analagous to a table in SQL).

See the official MongoDB Shell docs here: [https://www.mongodb.com/docs/mongodb-shell/crud/]()

### Updating the API

The API is written in Python and served through Flask.
The Apache server is configured with a WSGI module that hosts the Flask app securely for production use.

#### Testing

1. `cd` to the `server` directory
1. Make sure you have Python 3 and the associated `venv` package installed
   - This package is named differently depending on the OS/distro you are running
1. Run `python3 -m venv .venv` to create a virtual environment in the `.venv` directory
   - Virtual environments are used to avoid causing version conflicts that would result from installing every package system-wide
1. Run `source .venv/bin/activate` to enable the virtual environment
1. Run `pip install -r requirements.txt` to install the necessary libraries
1. Run `flask --app api.py run` to start the development server

#### Building

1. Repeat steps 1-5 above to create a virtual environment, but this time in `/srv/netmap/backend/`
1. Copy `api.py` to `/srv/netmap/backend/`

The Apache server serves the API from the `api` path of the web server, or `http://10.10.96.234/api/`.
Specific routes are defined in `api.py`.

### Updating the monitoring service

Make any changes in `monitor.py`, then copy the updated file to `/srv/netmap/backend/`. These is a cron job (run under `root`) that regularly runs this file. Be mindful to keep the `.env` file that contains the secrets needed to gain access to our nodes!
