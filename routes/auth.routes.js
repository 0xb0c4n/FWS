const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/me", authController.me);
router.post("/logout", authController.logout);
router.post("/user", authController.get_users)
router.post("/search-users", authController.searchUsers);
router.post("/send-message", authController.sendMessage);
router.get("/conversation", authController.getConversation);
router.get("/contacts", authController.getContacts);
router.post("/update-profile", authController.updateProfile);

module.exports = router;
