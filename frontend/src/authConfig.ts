import type { Configuration, PopupRequest } from "@azure/msal-browser";

// MSAL configuration
export const msalConfig: Configuration = {
    auth: {
        clientId: "b93949fe-44a1-4b51-a420-86fde6d7a14d",
        authority: "https://login.microsoftonline.com/9a3bb301-12fd-4106-a7f7-563f72cfdf69",
        redirectUri: window.location.origin,
    },
    cache: {
        cacheLocation: "localStorage"
    }
};

// Add here scopes for id token to be used at MS Identity Platform endpoints.
export const loginRequest: PopupRequest = {
    scopes: ["User.Read"]
};

// Add here the endpoints for MS Graph API services you would like to use.
export const graphConfig = {
    graphMeEndpoint: "https://graph.microsoft.com/v1.0/me"
};
