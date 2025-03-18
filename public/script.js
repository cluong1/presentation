



// Function to show a specific screen
function showScreen(screenToShow) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.style.display = "none"; 
    });
    screenToShow.style.display = "block"; 
}

document.addEventListener("DOMContentLoaded", function () {
    const sendMessageScreen = document.getElementById('sendMessageScreen')
    const readMessageScreen = document.getElementById('readMessageScreen');
    const accountCreationForm = document.getElementById("accountCreationForm");
    const accountLoginForm = document.getElementById("accountLoginForm");
    const sendMessageForm = document.getElementById("sendMessageForm");
    const viewInboxButton = document.getElementById('viewInboxButton');
    const clearInboxButton = document.getElementById('clearInboxButton');
    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
   

    if(canvas){
        canvas.addEventListener('mousedown',(event)=>{
            isDrawing=true;
            ctx.moveTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
        });

        canvas.addEventListener('mousemove',(event)=>{
            if(isDrawing){
                ctx.lineTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
                ctx.stroke();
            }
        });

        canvas.addEventListener('mouseup',() =>{
            isDrawing=false;
        });

        document.getElementById('clearCanvas').addEventListener('click', () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });

        const sendMessageForm = document.getElementById('sendMessageForm');
        sendMessageForm.addEventListener('submit', function(event) {

            const drawingData = canvas.toDataURL('image/png');

            const isBlank = drawingData === 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAACAQAAAD9zD5tAAAAmklEQVRIDbWBAQEAAAABIP6PzgpViwUkL7oJ1JWyQyy+ihly57q9A==';
            
            if(!isBlank){
                const drawingData = canvas.toDataURL('image/png'); 
                const drawingInput = document.createElement('input');
                drawingInput.type = 'hidden';
                drawingInput.name = 'drawing';
                drawingInput.value = drawingData;
                sendMessageForm.appendChild(drawingInput);
            }

            sendMessageForm.submit();
            
         });
    }

    if(viewInboxButton){
        viewInboxButton.addEventListener('click', function() {
            fetch('/inbox', {
                method: 'GET',
            })
            .then(response => response.json())  
            .then(data => {
                if (data.length > 0) {
                    const inboxContent = document.getElementById('inboxContent');
                    inboxContent.innerHTML = ''; 
    
                    data.forEach(message => {
                        const messageElement = document.createElement('div');
                        messageElement.classList.add('message-card');
                        messageElement.innerHTML = `
                            <p><strong>From:</strong> ${message.sender}</p>
                            <p><strong>Subject:</strong> ${message.subject}</p>
                            <p><strong>Body:</strong> ${message.body}</p>
                            `;

                            if (message.drawing && message.drawing.trim() !== '') {
                                const imageElement = document.createElement('img');
                                imageElement.src = message.drawing;
                                imageElement.alt = "Drawing";
                                imageElement.style.maxWidth = '100%';
                                messageElement.appendChild(imageElement);
                            }
                        inboxContent.appendChild(messageElement);
                    });
                } else {
                    alert('No messages found');
                }
                /*
                // Add event listeners to all delete buttons
                document.querySelectorAll('.deleteMessage').forEach(button => {
                    button.addEventListener('click', function () {
                        const messageId = this.getAttribute('data-id');
                        if (confirm('Are you sure you want to delete this message?')) {
                            fetch(`/delete-message/${messageId}`, { method: 'DELETE' })
                                .then(response => response.text())
                                .then(message => {
                                    alert(message);
                                    this.parentElement.remove(); // Remove message from UI
                                })
                                .catch(error => console.error("Error deleting message:", error));
                        }
                    });
                });
                */
            })
            .catch(error => {
                console.error('Error fetching inbox:', error);
                alert('Failed to load inbox messages');
            });
        });
    }

    if(clearInboxButton){
        clearInboxButton.addEventListener("click", function () {
            if (confirm("Are you sure you want to delete all your messages?")) {
                fetch('/clear-inbox', { method: 'DELETE' })
                    .then(response => response.text())
                    .then(message => {
                        alert(message);
                        document.getElementById('inboxContent').innerHTML = ''; 
                    })
                    .catch(error => console.error("Error clearing inbox:", error));
            }
        });
    }

    // Account creation form submission
    if(accountCreationForm){
        accountCreationForm.addEventListener("submit", function () {
            let usernameInput = document.getElementById("createUsername").value;
            let passwordInput = document.getElementById("createPassword").value;
            alert("submitted account with username: " + usernameInput + " password: " + passwordInput);
            console.log('submitted account');
        });
    }

    // Login form submission
    if(accountLoginForm){
        accountLoginForm.addEventListener("submit", function () {  
        alert('login attempted');
        showScreen(sendMessageScreen); 
        showScreen(readMessageScreen);
        });
    }


    
    if(sendMessageForm){
        sendMessageForm.addEventListener("submit", function(event){
            //event.preventDefault();
    
            const recipient=document.getElementById("recipient").value;
            const subject = document.getElementById("subject").value;
            const body = document.getElementById("body").value;
    
            if(!recipient || !subject || !body){
                alert("Please fill out all fields.");
                return;
            }
    
            fetch("/send-message", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    sender: user,
                    recipient: recipient,
                    subject: subject,
                    body: body
                })
            })
            .then(response => {
                if(response.ok) {
                    alert("Message sent");
                    window.location.reload();
                } else{
                    alert("failed to send message");
                }
            })
            .catch(err => {
                console.error(err);
                alert("error sending message");
            });
    
            alert("message sent!")
        });
    }
    
});