
import { useContext, useCallback } from 'react'
import UserContext from 'context/user'

const { gapi } = window

const useGoogleAPI = () => {
  const { updateUserProfile } = useContext(UserContext)

  const signIn = useCallback(() => gapi.auth2.getAuthInstance().signIn(), [])
  const signOut = useCallback(() => {
    gapi.auth2.getAuthInstance().signOut()
    updateUserProfile(null)
  }, [])

  const initUser = useCallback((isSignedIn) => {
    // When signin status changes, this function is called.
    // If the signin status is changed to signedIn, we make an API call.
    if (isSignedIn) {
      gapi.client.people.people.get({
        resourceName: 'people/me',
        personFields: 'names,locales,photos,emailAddresses',
      })
        .then(
          response => updateUserProfile(response.result),
          reason => console.log(`Error: ${reason.result.error.message}`), // eslint-disable-line
        )
    }
  }, [])

  const initClient = useCallback(() => gapi.load('client:auth2', () => {
    // Initialize the client with API key and People API, and initialize OAuth with an
    // OAuth 2.0 client ID and scopes (space delimited string) to request access.
    gapi.client.init({
      apiKey: 'AIzaSyAvRqMi5pnaGVCV14BlEfKGs9xePuhtZk0',
      discoveryDocs: [
        'https://people.googleapis.com/$discovery/rest?version=v1',
        'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest',
      ],
      clientId: '283173290792-09mip7ds9kjfo77qs1p4c3ea07pk2mot.apps.googleusercontent.com',
      scope: [
        'profile',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.compose',
        'https://www.googleapis.com/auth/gmail.send',
      ].join(' '),
    }).then(() => {
      // Listen for sign-in state changes.
      gapi.auth2.getAuthInstance().isSignedIn.listen(initUser)

      // Handle the initial sign-in state.
      initUser(gapi.auth2.getAuthInstance().isSignedIn.get())
    })
  }), [])
  return {
    apiClient: gapi.client, signIn, signOut, initClient,
  }
}

export default useGoogleAPI
