# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Prerequisites - Install the Following Packages

Run this command to install all the required dependencies
##### `npm install`


### Set up and test the application:
To implement the Vonage Video API in ReactJS, the first step is to create a new project for our application from the Vonage Dashboard in order to obtain the API key and secret. These credentials are necessary to authenticate requests to the Vonage API.

Create a sessionID from the dashboard and then create the publisher and subscribers token by choosing the role from the dropdown. Enter your credentials in `config.js` and the application will work.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

Open the sample in two tabs or windows and fill out the form details. You need to assign the role of 'host' to one user and 'guest' to another. When selecting 'host' as the role, additional fields will appear. Ensure to select the required source language. After joining the webinar as a host, click the 'Start Webinar' button. A new button labeled 'Start Publishing' will then appear. Before clicking on that button, ensure that the webinar has started properly and your websocket connection is established.

On the other hand, you need to join as a guest. After joining, click the 'Join Webinar' button. You will then see the publisher's video on the guest's end. There is a language selector for subscribers/guests; they can switch the language and will hear the audio in the selected language.


