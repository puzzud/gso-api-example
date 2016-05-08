function GetSignOnOptions()
{
  // TODO: Use SigninOptionsBuilder.
  var signOnOptions = {};

  var scopeList =
  [
    "profile",
    "email",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.appdata"
  ];

  signOnOptions.scope = scopeList.join( " " );

  signOnOptions.onsuccess = OnSignOnSuccess;
  signOnOptions.onfailure = OnSignOnFailure;

  signOnOptions.width = 240;
  signOnOptions.height = 32;
  signOnOptions.longtitle = true;
  signOnOptions.theme = "dark";

  return signOnOptions;
}

function RenderSignOnButton( signOnButtonDivId )
{ 
  signOnOptions = GetSignOnOptions();

  gapi.signin2.render( signOnButtonDivId, signOnOptions );
}

function UpdateAvatarImage()
{
  var gsoAvatarDivId = "gso-avatar";

  var gsoAvatarDivElement = document.getElementById( gsoAvatarDivId );
  if( gsoAvatarDivElement === undefined )
  {
    console.error( "Dom element does not exist: " + gsoAvatarDivId );
    return 1;
  }

  while( gsoAvatarDivElement.hasChildNodes() )
  {
    gsoAvatarDivElement.removeChild( gsoAvatarDivElement.lastChild );
  }

  var avatarImageUrl = "";

  var autho2 = GetAuth2();
  if( autho2.isSignedIn.get() )
  {
    var googleUser = GetGoogleUser();
    avatarImageUrl = GetAvatarImageUrl( googleUser );
  }

  // Create new image element.
  // TODO: Resuse existing image element.
  var img = document.createElement( "img" );
  img.src = avatarImageUrl;

  gsoAvatarDivElement.appendChild( img );
}

function GetAvatarImageUrl( googleUser )
{
  if( googleUser === undefined )
  {
    return "";
  }

  var profile = googleUser.getBasicProfile();
  return profile.getImageUrl();
}

function OnSignOnSuccess( googleUser )
{
  // Useful data for your client-side scripts:
  var profile = googleUser.getBasicProfile();
  console.log( "ID: " + profile.getId() ); // Don't send this directly to your server!
  console.log( "Full Name: " + profile.getName() );
  console.log( "Given Name: " + profile.getGivenName() );
  console.log( "Family Name: " + profile.getFamilyName() );
  console.log( "Image URL: " + profile.getImageUrl() );
  console.log( "Email: " + profile.getEmail() );

  // The ID token you need to pass to your backend:
  var id_token = googleUser.getAuthResponse().id_token;
  console.log( "ID Token: " + id_token );

  UpdateAvatarImage();

  InitializeDrive();
}

function OnSignOnFailure( error )
{
  console.log( error );

  UpdateAvatarImage();
}

function GetAuth2()
{
  var auth2 = gapi.auth2.getAuthInstance();

  return auth2;
}

function SignOut()
{
  var auth2 = GetAuth2();

  // Unauthorize all scopes.
  auth2.disconnect();

  // Actually sign out.
  auth2.signOut().then( OnSignOut );
}

function OnSignOut()
{
  var googleUser = GetGoogleUser();
  var profile = googleUser.getBasicProfile();

  // TODO: I think there is a way to verify email
  // address as having been veried via Google.
  var googleUserEmail = profile.getEmail();

  console.log( "User '" + googleUserEmail + "' signed out." );

  UpdateAvatarImage();

  RenderDriveButtons();
}

function GetGoogleUser( auth2 )
{
  if( auth2 === undefined )
  {
    auth2 = GetAuth2();
    if( auth2 === undefined )
    {
      return null;
    }
  }

  var googleUser = auth2.currentUser.get();
  
  return googleUser;
}

function GetScopeList()
{
  var googleUser = GetGoogleUser();
  var scopes = googleUser.getGrantedScopes();
  if( scopes === null )
  {
    return [];
  }

  var scopeList = scopes.split( " " );
  return scopeList;
}

function PrintScopes()
{
  var scopeList = GetScopeList();
  if( scopeList.length < 1 )
  {
    console.log( "No Authorized Scopes" );
    return;
  }
  
  console.log( "Authorized Scopes:" );
  for( var i in scopeList )
  {
    console.log( scopeList[i] );
  }
  console.log( "" );
}

function InitializeDrive()
{
  //gapi.client.setApiKey( "AIzaSyChRTKWwletihX3xnAtvL1I1dLQ98HO400" );

  gapi.load
  (
    "client",
    function()
    {
      gapi.client.load( "drive", "v3" ).then( RenderDriveButtons );
    }
  );
}

function RenderDriveButtons()
{
  var gsoDriveButtonsDivId = "gso-drive-buttons";

  var gsoDriveButtonsDivElement = document.getElementById( gsoDriveButtonsDivId );
  if( gsoDriveButtonsDivElement === undefined )
  {
    console.error( "Dom element does not exist: " + gsoDriveButtonsDivId );
    return 1;
  }

  while( gsoDriveButtonsDivElement.hasChildNodes() )
  {
    gsoDriveButtonsDivElement.removeChild( gsoDriveButtonsDivElement.lastChild );
  }

  var autho2 = GetAuth2();
  if( !autho2.isSignedIn.get() )
  {
    return;
  }

  var a = null;
  a = document.createElement( "a" );
  a.href = "#";
  a.onclick = PrintFiles;
  a.textContent = "Print Files";
  gsoDriveButtonsDivElement.appendChild( a );

  gsoDriveButtonsDivElement.appendChild( document.createElement( "br" ) );

  a = document.createElement( "a" );
  a.href = "#";
  a.onclick = CreateFile;
  a.textContent = "Create File";
  gsoDriveButtonsDivElement.appendChild( a );

  gsoDriveButtonsDivElement.appendChild( document.createElement( "br" ) );

  a = document.createElement( "a" );
  a.href = "#";
  a.onclick = DeleteFiles;
  a.textContent = "Delete Files";
  gsoDriveButtonsDivElement.appendChild( a );
}

function OnDriveFilesList( data )
{
  data = JSON.parse( data.body );
  var fileList = data.files;

  var mimeTypeFilter = "application/vnd.google-apps.spreadsheet";

  console.log( "Drive Files:" );
  for( var i in fileList )
  {
    var file = fileList[i];
    //if( file.mimeType === mimeTypeFilter )
    //if( file.name.includes( "txt" ) )
    {
      console.log( file.name );
      //console.log( file.id + ":" + file.mimeType );
      //DownloadFile( file, OnDownloadFile );
      //break;
    }
  }
  console.log( "" );
}

function PrintFiles()
{
  if( gapi.client.drive === undefined )
  {
    console.error( "gapi.client.drive is undefined." );
    return;
  }

  var driveFilesListOptions =
  {
    fields: 'files',
    //spaces: 'appDataFolder',
    //fields: 'nextPageToken, files(id, name)',
    //pageSize: 4
  };

  gapi.client.drive.files.list( driveFilesListOptions )
    .then( OnDriveFilesList );
}

function OnDownloadFile( content )
{
  console.log( content );
}

function DownloadFile( file, callback )
{
  /*
  if (file.webContentLink)
  {
    var googleUser = GetGoogleUser();
    var id_token = googleUser.getAuthResponse().id_token;
    var accessToken = id_token;//token.access_token;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', file.webContentLink);
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.onload = function() {
      callback(xhr.responseText);
    };
    xhr.onerror = function() {
      callback(null);
    };
    xhr.send();
  } else {
    callback(null);
  }
  */
}

function CreateFile()
{
  if( gapi.client.drive === undefined )
  {
    console.error( "gapi.client.drive is undefined." );
    return;
  }

  //OpenFile( 'files/test.txt' );
  //return;

  //var file = new File( ["asdf"], "test.txt" );

  var options =
  {
    //spaces: 'appDataFolder',
    //resource: fileMetadata,
    //media: media,
    //fields: 'id',
    mimeType: 'text/plain',
    'name': 'test.txt',
    //'parents': [ 'appDataFolder']
  };

  gapi.client.drive.files.create( options )
    .then( OnFileCreate );
}

function OnFileCreate( data )
{
  data = JSON.parse( data.body );

  console.log( "File created:  " + data.name );

  var fileId = data.id;
  //var path = '/drive/v3/files/'+fileId+'?uploadType=media';
  var text = "asdf";

  const boundary = '-------314159265358979323846';
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";

  var metadata = { 
      description : 'savefile for my game',
      'mimeType': 'text/plain'
  };  

  var multipartRequestBody =
    delimiter +  'Content-Type: text/plain\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter + 'Content-Type: text/plain\r\n\r\n' +
    text +
    close_delim;

  multipartRequestBody = text;

  var request = gapi.client.request
    ( { 
     'path': '/upload/drive/v3/files/' + fileId,
     'method': 'PATCH',
     'params': {'fileId': fileId, 'uploadType': 'multipart'},
     //'headers': { 'Content-Type': 'multipart/form-data; boundary="' + boundary + '"', 'Authorization': 'Bearer ' + auth_token, },
     'body': multipartRequestBody 
     });

  request.execute(function(resp)
  {
    resp = resp;
  });
}

function OpenFile( fileName )
{
  /*
  var reader = new FileReader();
  var file = new File( ["asdf"], fileName );

  reader.onloadend = function(e)
  {
    var text = reader.result;
    console.log( text );
  }

  reader.readAsText(file);
  */
}

function DeleteFiles()
{
  if( gapi.client.drive === undefined )
  {
    console.error( "gapi.client.drive is undefined." );
    return;
  }

  // TODO: Retrieve fileIds.
  var fileId = "";

  /*
  var request = gapi.client.request(
  {
    'path': '/drive/v3/files/' + fileId,
    'method': 'DELETE',
    //'params': {'maxResults': '1'}
  });

  request.execute(function(resp)
  {
    resp = resp;
  });
  */
}