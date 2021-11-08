const socket = io();

// ELEMENTS
const messageForm = document.getElementById("message-form");
const messageFormButton = document.getElementById("btn");
const sendLoactionButton = document.getElementById("send-location");
const input = document.getElementById("input");
const message = document.getElementById("message");

// TEMPLATES
const messageTemplate = document.getElementById("message-template").innerHTML;
const locationTemplate = document.getElementById("location-template").innerHTML;
const sidebarTemplate = document.getElementById("sidebar-template").innerHTML;

// Options
// location.search gives us the query string  "?username="rahul"&room="new_room"" & Qs.parse() will help us to extract user and room
// ignoreQueryPrefix: true --> makes sure that our question mark goes away
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  // New message element
  const newMessage = message.lastElementChild;
  // Height of the new message
  const newMessageStyles = getComputedStyle(newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

  // visible height
  const visibleHeight = message.offsetHeight;

  // Height of message container
  const containerHeight = message.scrollHeight;
  // How far have i scrolled ?
  const scrollOffset = message.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    message.scrollTop = message.scrollHeight;
  }
};

// on recieving event 'message' from the server
socket.on("message", (msg) => {
  const html = Mustache.render(messageTemplate, {
    username: msg.username,
    message: msg.text,
    createdAt: moment(msg.createdAt).format("h:mm a"),
  });
  message.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

// on recieving location

socket.on("locationMessage", (url) => {
  const html = Mustache.render(locationTemplate, {
    username: url.username,
    url: url.url,
    createdAt: moment(url.createdAt).format("h:mm a"),
  });
  message.insertAdjacentHTML("beforeend", html);
  autoscroll();
});
// room data
socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.getElementById("sidebar").innerHTML = html;
});
messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  // disable the button
  messageFormButton.setAttribute("disabled", "disabled");
  const message = e.target.elements.message.value;

  socket.emit("sendMessage", message);
  // enable
  messageFormButton.removeAttribute("disabled");
  input.value = "";
  input.focus();
});

sendLoactionButton.addEventListener("click", (e) => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }
  // disable button
  sendLoactionButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        // Enable button
        sendLoactionButton.removeAttribute("disabled");

        // ACKNOWLEDGEMENT
        // step 1 = Location is shared {lat,long}
        // step 2 = server recieves the location and then acknowledges it  i.e by callback()
        // step 3 = client logs the message "Location shared !"
      }
    );
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/"; //takes us back to the root/prev address
  }
});
