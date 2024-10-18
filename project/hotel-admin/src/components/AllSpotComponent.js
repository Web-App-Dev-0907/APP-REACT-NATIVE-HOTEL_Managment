import { useState, useEffect } from "react";
import { http } from "../helper/http";
import EditIcon from "./SvgIcons/EditIcon";
import DeleteIcon from "./SvgIcons/DeleteIcon";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
const AllSpotComponent = () => {
  const [spots, setSpots] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    http.get("/admin/get_spot_identifiers").then((response) => {
      setSpots(response.data.spots);
    });
  }, []);

  const toEdit = (_id) => {
    navigate(`/dashboard/add_spot/${_id}`);
  };

  const toDelete = (_id) => {
    http.delete(`/admin/delete_spot/${_id}`).then((response) => {
      if (response.data.message === "Spot deleted successfully") {
        toast.success("Spot deleted successfully");
        http.get("/admin/get_spot_identifiers").then((response) => {
          setSpots(response.data.spots);
        });
      }
    });
  };
  return (
    <div>
      <h1 className="text-4xl text-black text-left font-abril font-semibold mb-11">
        List All Spots
      </h1>
      {spots.map((spot) => (
        <div key={spot._id} className="flex gap-2">
          <div className="w-[300px] h-[60px] rounded-[13px] px-5 bg-white flex items-center mb-2 text-ellipsis">
            {spot.identifier}
          </div>
          <div
            className="h-[60px] w-[60px] rounded-[13px] bg-white flex items-center justify-center cursor-pointer hover:bg-[#EEE] p-3"
            onClick={() => toEdit(spot._id)}
          >
            <EditIcon />
          </div>
          <div
            className="h-[60px] w-[60px] rounded-[13px] bg-white flex items-center justify-center cursor-pointer hover:bg-[#EEE] p-3"
            onClick={() => toDelete(spot._id)}
          >
            <DeleteIcon />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AllSpotComponent;
