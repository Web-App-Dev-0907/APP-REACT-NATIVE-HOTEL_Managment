export const adminLinks = [
  { title: "DashBoard" },
  { title: "Sales", path: "sales" },
  { title: "Users" },
  {
    title: "Hotels",
    subLinks: [
      { title: "Add Hotel", path: "add_hotel" },
      {
        title: "Add Room To Hotel",
        path: "add_room",
      },
      {
        title: "List All Hotels",
        path: "all_hotels",
      },
    ],
  },
  {
    title: "Spots",
    subLinks: [
      { title: "Add Spot", path: "add_spot" },
      {
        title: "Add Ticket to Spot",
        path: "add_ticket",
      },
      { title: "List All Spots", path: "all_spots" },
    ],
  },
  {
    title: "Type",
    subLinks: [
      {
        title: "Add Type To Hotel",
        path: "add_type_hotel",
      },
      {
        title: "Add Type To Spot",
        path: "add_type_spot",
      },
    ],
  },
  {
    title: "Amenities",
    subLinks: [
      {
        title: "Add Amenity To Hotel",
        path: "add_amenity_hotel",
      },
      {
        title: "Add Amenity To Spot",
        path: "add_amenity_spot",
      },
    ],
  },
  {
    title: "Check-In Policies",
    subLinks: [
      {
        title: "Add Check-In Policy To Hotel",
        path: "add_check_in_policy_hotel",
      },
      {
        title: "Add Check-In Policy To Spot",
        path: "add_check_in_policy_spot",
      },
    ],
  },
  {
    title: "Check-Out Policies",
    subLinks: [
      {
        title: "Add Check-Out Policy To Hotel",
        path: "add_check_out_policy_hotel",
      },
      {
        title: "Add Check-Out Policy To Spot",
        path: "add_check_out_policy_spot",
      },
    ],
  },
  {
    title: "Cancellation Policies",
    subLinks: [
      {
        title: "Add Cancellation Policy To Hotel",
        path: "add_cancellation_policy_hotel",
      },
      {
        title: "Add Cancellation Policy To Spot",
        path: "add_cancellation_policy_spot",
      },
    ],
  },
];

export const hotelLinks = [
  { title: "Sales", path: "sales" },
  {
    title: "Hotels",
    subLinks: [{ title: "Add Room To Hotel", path: "add_room" }],
  },
];

export const spotLinks = [
  { title: "Sales", path: "sales" },
  {
    title: "Spots",
    subLinks: [{ title: "Add Ticket to Spot", path: "add_ticket" }],
  },
];
