const express = require("express");
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const path = require('path');

app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.json());

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

const messagesFilePath = path.join(__dirname, 'messages.json');

function readMessagesFromFile(callback) {
    fs.readFile(messagesFilePath, 'utf-8', (err, data) => {
        if (err) {
            console.error("Error reading file:", err);
            callback([]);
        } else {
            if(!data){
                callback([]);
            }
            else{
                try{
                    const messages = JSON.parse(data);
                    callback(messages);
                }
                catch (e){
                    console.error('error parsing json: ',e);
                    callback([]);
                }
            }
        }
    });
}

function writeMessagesToFile(messages, callback) {
    fs.writeFile(messagesFilePath, JSON.stringify(messages, null, 2), (err) => {
        if (err) {
            console.error("error writing file: ",err);
        } else{
            callback();
        }
    });
}


function getUserMessages(username, callback){
    fs.readFile(messagesFilePath, 'utf-8', (err, data) => {
        if (err) {
          console.error('Error reading file:', err);
          callback([]);
        } else {
          const messages = JSON.parse(data);
          const userMessages = messages.filter(message => message.recipient === username);
          callback(userMessages);
        }
      });
}

app.post('/send-message', (req, res) => {
    const { recipient, subject, body, drawing } = req.body;
    const sender = req.session.user;

    if(!sender){
        return res.status(400).send('All fields are required. Missing sender');
    }
    if(!recipient){
        return res.status(400).send('All fields are required. Missing recipient');
    }
    if(!subject){
        return res.status(400).send('All fields are required. Missing subject');
    }
    if(!body){
        return res.status(400).send('All fields are required. Missing body');
    }

    const messageDrawing = drawing && drawing !== '' ? drawing : null;

    readMessagesFromFile((messages) => {
        const newMessage = {
            sender,
            recipient,
            subject,
            body,
            drawing: messageDrawing
        };
        messages.push(newMessage);

        writeMessagesToFile(messages, () => {
            res.redirect('/');
        });
    });
});

app.get('/inbox', (req, res) => {
    const user = req.session.user;
    if (user) {
        getUserMessages(user, (userMessages) => {
            console.log("User messages:", userMessages); 
            res.json(userMessages || []);  
        });
    } else {
        res.status(401).send('User not logged in');
    }
});
/*
app.delete('/delete-message/:id',(req,res) => {
    const user = req.session.uiser;
    const messageId = req.params.id;

    fs.readFile('messages.json', 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).send('Server error');
        }

        let messages = JSON.parse(data);
        const filteredMessages = messages.filter(msg => msg.id !== messageId || msg.recipient !== user);

        fs.writeFile('messages.json', JSON.stringify(filteredMessages), (err) => {
            if (err) {
                return res.status(500).send('Failed to delete message');
            }
            res.send('Message deleted successfully');
        });
    });
})
*/
app.delete('/clear-inbox', (req, res) =>{
    const user = req.session.user;
    fs.readFile('messages.json', 'utf-8', (err,data) => {
        if (err) {
            return res.status(500).send('server error');
        }

        let messages = JSON.parse(data);
        const filteredMessages = messages.filter(msg => msg.recipient !== user);

        fs.writeFile('messages.json', JSON.stringify(filteredMessages), (err) => {
            if (err) {
                return res.status(500).send('failed to clear inbox error');
            }
            res.send('inbox cleared');
        });
    });

});


app.post('/login', (req, res) => {
    const { username, password } = req.body;

    fs.readFile('users.json', 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).send('Server error.');
        }

        const users = JSON.parse(data);
        const user = users.find(user => user.username === username && user.password === password);

        if (user) {
            req.session.user = username;  
            res.redirect('/');
        } else {
            res.redirect('/');
        }
    });
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if(err) {
            return res.status(500).send('Failed to log out');
        }
        res.redirect('/');
    })
});

app.post('/check-username', (req,res) => {
    const {username, password } = req.body;

    fs.readFile('users.json', 'utf-8', (err, data) => {
        if (err) {
            console.error("Error reading file: ", err);
            return res.status(500).send("Server error.");
        }

        const users = JSON.parse(data);

        const usernameExists = users.some(user => user.username === username);

        if(usernameExists) {
            return res.send("Username is taken.");
        }

        users.push({ username, password });

        fs.writeFile('users.json', JSON.stringify(users,null, 2), (err) => {
            if (err) {
                console.error("Error writing file: ",err);
                return res.status(500).send('Server Error');
            }
            return res.send("Username is unique. Registration successfully completed.");
        });
    });
});



app.use(express.static("public"));

app.set("views", "./views");
app.set("view engine", "pug");

//make user object available in all pug template
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

app.get("/", function(req, res){
    const message = req.query.message || '';
    res.render('hello.pug', { message });
    //res.render("hello.pug");
});

app.listen(3011, () => {
    console.log("server running on port 3011")
});

