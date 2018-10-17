const express = require("express"); // like import to a variable
const router = express.Router();

const UserController = require('../controllers/user');
const UserProfile = require('../controllers/profile');
const checkAuth = require('../middleware/check-auth');
const workFlow = require('../controllers/workFlow');

router.post("/signup", UserController.user_signup);

router.post("/login", UserController.user_login);

// show developers-details and logs
router.get("/details",checkAuth, UserProfile.showDeveloperDetails);
router.get("/devloperlist",checkAuth, UserProfile.showDevelopers);
router.post("/showlogs",checkAuth, UserProfile.showLogs);
router.get("/showdevices",checkAuth, UserProfile.showDevices);
router.post("/recivedToGateway",workFlow.receivedMessage);
router.post("/receivedForDeveloper",UserProfile.receivedForDeveloper);
//To test stubs:
router.post("/addMessage", UserProfile.addMessage);
router.post("/addDevice", UserProfile.addDevice);

router.put("/profile/edit",checkAuth,UserProfile.editProfile);

router.delete("/:userId", checkAuth, UserController.user_delete);
//fcm server routes
router.post("/sendToDevice",workFlow.SendToDevice);
module.exports = router;
