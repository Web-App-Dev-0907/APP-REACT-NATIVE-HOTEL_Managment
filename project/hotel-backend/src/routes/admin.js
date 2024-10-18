const { Router } = require("express");
const adminController = require("../controllers/admin");
const router = Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Set up storage with multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../../src/uploads");
    fs.exists(dir, (exist) => {
      if (!exist) {
        return fs.mkdir(dir, (error) => cb(error, dir));
      }
      return cb(null, dir);
    });
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); //Appending extension
  },
});

const upload = multer({ storage: storage });
router.post("/signin", adminController.signIn);
router.post("/user_signin", adminController.userSignIn);
router.post("/add_hotel", upload.array("images"), adminController.addHotel);
router.post(
  "/update_hotel",
  upload.array("images"),
  adminController.updateHotel
);
router.post("/add_room", upload.array("images"), adminController.addRoom);
router.post("/update_room", upload.array("images"), adminController.updateRoom);
router.post("/add_spot", upload.array("images"), adminController.addSpot);
router.post("/update_spot", upload.array("images"), adminController.updateSpot);
router.post("/add_ticket", upload.array("images"), adminController.addTicket);
router.post(
  "/update_ticket",
  upload.array("images"),
  adminController.updateTicket
);
router.get("/get_hotel_identifiers", adminController.getHotelIdentifiers);
router.get("/get_spot_identifiers", adminController.getSpotIdentifiers);
router.get("/all_hotels", adminController.allHotels);
router.get("/get_hotel/:id", adminController.getHotel);
router.get("/get_room/:id", adminController.getRoom);
router.get("/get_spot/:id", adminController.getSpot);
router.get("/get_ticket/:id", adminController.getTicket);
router.delete("/delete_hotel/:id", adminController.deleteHotel);
router.delete("/delete_room/:id", adminController.deleteRoom);
router.delete("/delete_spot/:id", adminController.deleteSpot);
router.delete("/delete_ticket/:id", adminController.deleteTicket);
router.get(
  "/identifier_matched/:identifier",
  adminController.identifierMatched
);
router.post("/get_sales", adminController.getSales);
router.post("/add_type", upload.array("images"), adminController.addType);
router.post("/update_type", upload.array("images"), adminController.updateType);
router.get("/get_types/:type", adminController.getTypes);
router.get("/get_type/:id", adminController.getType);
router.delete("/delete_type/:id", adminController.deleteType);
router.post("/add_amenity", upload.array("images"), adminController.addAmenity);
router.post(
  "/update_amenity",
  upload.array("images"),
  adminController.updateAmenity
);
router.get("/get_amenities/:type", adminController.getAmenities);
router.get("/get_amenity/:id", adminController.getAmenity);
router.delete("/delete_amenity/:id", adminController.deleteAmenity);
router.post("/add_check_in_policy", adminController.addCheckInPolicy);
router.post("/update_check_in_policy", adminController.updateCheckInPolicy);
router.get("/get_check_in_policies/:type", adminController.getCheckInPolicies);
router.get("/get_check_in_policy/:id", adminController.getCheckInPolicy);
router.delete(
  "/delete_check_in_policy/:id",
  adminController.deleteCheckInPolicy
);
router.post("/add_check_out_policy", adminController.addCheckOutPolicy);
router.post("/update_check_out_policy", adminController.updateCheckOutPolicy);
router.get(
  "/get_check_out_policies/:type",
  adminController.getCheckOutPolicies
);
router.get("/get_check_out_policy/:id", adminController.getCheckOutPolicy);
router.delete(
  "/delete_check_out_policy/:id",
  adminController.deleteCheckOutPolicy
);

router.post("/add_cancellation_policy", adminController.addCancellationPolicy);
router.post(
  "/update_cancellation_policy",
  adminController.updateCancellationPolicy
);
router.get(
  "/get_cancellation_policies/:type",
  adminController.getCancellationPolicies
);
router.get(
  "/get_cancellation_policy/:id",
  adminController.getCancellationPolicy
);
router.delete(
  "/delete_cancellation_policy/:id",
  adminController.deleteCancellationPolicy
);
module.exports = router;
