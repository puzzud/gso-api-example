# gso-api-example
An example of Google Sign On, Google API for web based Javascript.

**Setup**
 - Create a new project in the *Google API Developer Console* (https://console.developers.google.com).
 - Set up your a project application credentials (including API key and OAuth 2.0 key).
 - Set OAuth 2.0 key *Authorized JavaScript origins* and *Authorized redirect URIs* to an accessible web server (can be localhost).
 - Change the references to these keys in index.html and main.js.

**Examples**
 - Google Sign On authentication via pressing a button.
 - Authorization of some Google Drive APIs after authentication.
 - Link to list all currently authorized API "scopes".
 - Link to print all current Google user's Drive files to console.
 - Link to create and populate a new text file called *test.txt* and put it in the root of the current Google user's Drive.
