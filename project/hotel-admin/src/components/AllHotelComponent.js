import { useState, useEffect } from "react";
import { http } from "../helper/http";
import EditIcon from "./SvgIcons/EditIcon";
import DeleteIcon from "./SvgIcons/DeleteIcon";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
const AllHotelComponent = () => {
  const [hotels, setHotels] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    http.get("/admin/get_hotel_identifiers").then((response) => {
      setHotels(response.data.hotels);
    });
  }, []);

  const toEdit = (_id) => {
    navigate(`/dashboard/add_hotel/${_id}`);
  };

  const toDelete = (_id) => {
    http.delete(`/admin/delete_hotel/${_id}`).then((response) => {
      if (response.data.message === "Hotel deleted successfully") {
        toast.success("Hotel deleted successfully");
        http.get("/admin/get_hotel_identifiers").then((response) => {
          setHotels(response.data.hotels);
        });
      }
    });
  };
  return (
    <div>
      <h1 className="text-4xl text-black text-left font-abril font-semibold mb-11">
        List All Hotels
      </h1>
      {hotels.map((hotel) => (
        <div key={hotel.id} className="flex gap-2">
          <div className="w-[300px] h-[60px] rounded-[13px] px-5 bg-white flex items-center mb-2 text-ellipsis">
            {hotel.identifier}
          </div>
          <div
            className="h-[60px] w-[60px] rounded-[13px] bg-white flex items-center justify-center cursor-pointer hover:bg-[#EEE] p-3"
            onClick={() => toEdit(hotel._id)}
          >
            <EditIcon />
          </div>
          <div
            className="h-[60px] w-[60px] rounded-[13px] bg-white flex items-center justify-center cursor-pointer hover:bg-[#EEE] p-3"
            onClick={() => toDelete(hotel._id)}
          >
            <DeleteIcon />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AllHotelComponent;
