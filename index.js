const http = require('http');
const url = require('url');
require('dotenv').config()
const {google} = require('googleapis');
const { env } = require('process');
const scope = 'https://www.googleapis.com/auth/calendar';
const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    "http://localhost:3000/rest/v1/calendar/redirect/"
 );
 async function listEvents() {
  let p=''
    const calendar = google.calendar({version: 'v3', auth:oauth2Client});
    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 30,
      singleEvents: true,
      orderBy: 'startTime',
    });
    const events = res.data.items;
    if (!events || events.length === 0) {
      console.log('No upcoming events found.');
      let k='No upcoming events found.'
      return k;
    }
    console.log('Upcoming 10 events:');
    events.map((event, i) => {
      const start = event.start.dateTime || event.start.date;
      console.log(`${start} - ${event.summary}`);
      p=(`${start} - ${event.summary}`);
      
    }
    );
    return p;
  }



async function main(){
 const server= http.createServer(async (req, res) => {
    if (req.url == '/rest/v1/calendar/init/') {
        res.writeHead(302, { "Location": 'https://accounts.google.com/o/oauth2/auth/oauthchooseaccount?scope='+scope+
                  '&response_type=code&access_type=offline&redirect_uri=http://localhost:3000/rest/v1/calendar/redirect/&client_id='
                              +process.env.CLIENT_ID+'&service=lso&o2v=1&flowName=GeneralOAuthFlow' });
        res.end();
        console.log("request completed")
    } 
    if(req.url.startsWith('/rest/v1/calendar/redirect')){
        let q = url.parse(req.url, true).query;
        if (q.error) { 
          console.log('Error:' + q.error);
        } else { 
          let { tokens } = await oauth2Client.getToken(q.code);
          oauth2Client.setCredentials(tokens);           
          userCredential = tokens;        
        res.writeHead(200);
        res.end(await listEvents())
        console.log("List fetched successfully!")        
        }
    }
  }).listen(3000);
}
main()