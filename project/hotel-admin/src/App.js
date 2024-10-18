import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AdminSignIn from "./Screen/AdminSignIn";
import UserSignIn from "./Screen/UserSignIn";
import Dashboard from "./Screen/Dashboard";
import AddHotelComponent from "./components/AddHotelComponent";
import AddRoomComponent from "./components/AddRoomComponent";
import AddSpotComponent from "./components/AddSpotComponent";
import AddTicketComponent from "./components/AddTicketComponent";
import AllHotelComponent from "./components/AllHotelComponent";
import AllSpotComponent from "./components/AllSpotComponent";
import SalesComponent from "./components/SalesComponent";
import TypeComponent from "./components/TypeComponent";
import AmenityComponent from "./components/AmenityComponent";
import AddCheckInPolicyComponent from "./components/AddCheckInPolicyComponent";
import AddCheckOutPolicyComponent from "./components/AddCheckOutPolicyComponent";
import AddCancellationPolicyComponent from "./components/AddCancellationPolicyComponent";
import Home from "./Screen/Home";
function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="admin_signin" element={<AdminSignIn />} />
          <Route path="user_signin" element={<UserSignIn />} />
          <Route path="dashboard" element={<Dashboard />}>
            <Route path="*" element={<></>} />
            <Route path="add_hotel" element={<AddHotelComponent />} />
            <Route path="add_hotel/:_id" element={<AddHotelComponent />} />
            <Route path="add_room" element={<AddRoomComponent />} />
            <Route path="add_room/:_id" element={<AddRoomComponent />} />
            <Route path="add_spot" element={<AddSpotComponent />} />
            <Route path="add_spot/:_id" element={<AddSpotComponent />} />
            <Route path="add_ticket" element={<AddTicketComponent />} />
            <Route path="add_ticket/:_id" element={<AddTicketComponent />} />
            <Route path="all_hotels" element={<AllHotelComponent />} />
            <Route path="all_spots" element={<AllSpotComponent />} />
            <Route path="sales" element={<SalesComponent />} />
            <Route path="add_type_hotel" element={<TypeComponent />} />
            <Route path="add_type_hotel/:_id" element={<TypeComponent />} />
            <Route path="add_type_spot" element={<TypeComponent />} />
            <Route path="add_type_spot/:_id" element={<TypeComponent />} />
            <Route path="add_amenity_hotel" element={<AmenityComponent />} />
            <Route
              path="add_amenity_hotel/:_id"
              element={<AmenityComponent />}
            />
            <Route path="add_amenity_spot" element={<AmenityComponent />} />
            <Route
              path="add_amenity_spot/:_id"
              element={<AmenityComponent />}
            />
            <Route
              path="add_check_in_policy_hotel"
              element={<AddCheckInPolicyComponent />}
            />
            <Route
              path="add_check_in_policy_hotel/:_id"
              element={<AddCheckInPolicyComponent />}
            />
            <Route
              path="add_check_in_policy_spot"
              element={<AddCheckInPolicyComponent />}
            />
            <Route
              path="add_check_in_policy_spot/:_id"
              element={<AddCheckInPolicyComponent />}
            />
            <Route
              path="add_check_out_policy_hotel"
              element={<AddCheckOutPolicyComponent />}
            />
            <Route
              path="add_check_out_policy_hotel/:_id"
              element={<AddCheckOutPolicyComponent />}
            />
            <Route
              path="add_check_out_policy_spot"
              element={<AddCheckOutPolicyComponent />}
            />
            <Route
              path="add_check_out_policy_spot/:_id"
              element={<AddCheckOutPolicyComponent />}
            />

            <Route
              path="add_cancellation_policy_hotel"
              element={<AddCancellationPolicyComponent />}
            />
            <Route
              path="add_cancellation_policy_hotel/:_id"
              element={<AddCancellationPolicyComponent />}
            />
            <Route
              path="add_cancellation_policy_spot"
              element={<AddCancellationPolicyComponent />}
            />
            <Route
              path="add_cancellation_policy_spot/:_id"
              element={<AddCancellationPolicyComponent />}
            />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
