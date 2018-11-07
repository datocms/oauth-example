/*
* You will need a client ID to have access to the DatoCms Oauth2 API,
* to get one for your app contact: support@datocms.com.
*/

const clientId       = 'eb321c597aec32598153b0c3cdb0dbdc438b742d1a77f59fc7eeb7a3900d1029';
const hash           = document.location.hash;
const authLink       = document.getElementById('auth-url');
const permissionList = document.getElementById('permission-list');

/*
 * The Oauth2 implicit grant flow works by sending the user to DatoCms where she'll
 * be asked to grant authorization to your application. DatoCms will then redirect
 * back to the set Redirect URI and set an access_token parameter
 * in the "hash" part of the URL.
 * From this point we can start doing API requests on their behalf.
 * If no hash is present, we'll trigger the first step.
 */

if (hash) {
  getAccessToken();
} else {
  start();
}

function start() {
  document.getElementById('step-2').style.display = 'none';

  /*
  * We generate a random state that we'll validate when DatoCms redirects back to
  * our app. It is used to guard against CSRF attacks as described in:
  * https://tools.ietf.org/html/rfc6749#section-10.12
  */

  const state = Math.random();
  localStorage.setItem(state, true);
  /*
  * DatoCMS will redirect to the current page
  */
  const redirectURI = document.location.href;

  const scopes = ['read_sites'];

  authLink.href = 'https://oauth.datocms.com/oauth/authorize?' +
      'client_id=' + clientId +
      '&response_type=token' +
      '&redirect_uri=' + redirectURI +
      '&state=' + state +
      '&scope=' + scopes.join(',');

  scopes.forEach((scope) => {
    const li = document.createElement('li');
    li.appendChild(document.createTextNode(scope));
    permissionList.appendChild(li);
  });
}

/*
 * The function getAccessToken is called when a user returns from DatoCms and has accepted the
 * request to authorize your app. It extracts the token from the response and use it to do a simple API request
 * fetching the user's sites from DatoCms.
 */

function getAccessToken() {
  /*
  *The access token is returned in the hash part of the document.location
  * #access_token=1234&response_type=token
  */

  const response = hash.replace(/^#/, '').split('&').reduce((result, pair) => {
    const keyValue = pair.split('=');
    result[keyValue[0]] = keyValue[1];
    return result;
  }, {});



  if (!localStorage.getItem(response.state)) {
    // We need to verify the random state we have set before starting the request,
    // otherwise this could be an access token belonging to someone else rather than our user
    document.getElementById('step-2').style.display = 'none';
    alert("CSRF Attack");
    return;
  }

  if (response.access_token) {
    document.getElementById('step-1').style.display = 'none';
  } else {
    start();
    const error = document.createElement('p');
    error.innerHTML = response.error_description.split('+').join(' ');
    document.getElementById('step-1').appendChild(error);
    return;
  }

  localStorage.removeItem(response.state);

  // The token is removed from the URL
  document.location.hash = '';

  // The token is used to fetch the user's list of sites from the account API
  fetch('https://account-api.datocms.com/sites', {
    headers: {
      'Authorization': 'Bearer ' + response.access_token,
      'Accept': 'application/json',
    }
  }).then((response) => {
    return response.json();
  }).then((json) => {
    showOutput('Your sites: ' + json.data.map((site) => {
      const domain = site.attributes.domain || site.attributes.internal_domain;
      const url = `https://${domain}/`;
      const accessUrl = `${url}enter?access_token=${site.attributes.access_token}`;
      `<a href="${site.attributes.url}">${site.attributes.name}</a>`
    }).join(','));
  }).catch((error) => {
    showOutput(`Error fetching sites: ${error}`);
  });
}

/*
 * Small helper method to show some output in the last step of the flow
 */
function showOutput(text) {
  document.getElementById('output').innerHTML = text;
}
