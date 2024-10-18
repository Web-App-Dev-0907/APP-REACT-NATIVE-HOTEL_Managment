import { useEffect, useState } from "react";
import {
  Button,
  GoogleAutocomplete,
  Input,
  Modal,
  Select,
  TextArea,
} from "./CustomTheme";
import { http, uploadPath } from "../helper/http";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, useNavigate } from "react-router-dom";
import EditIcon from "./SvgIcons/EditIcon";
import DeleteIcon from "./SvgIcons/DeleteIcon";
const AddHotelComponent = () => {
  const navigate = useNavigate();
  const { _id } = useParams();
  const [isEdit, setIsEdit] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [position, setPosition] = useState([0, 0]); // [latitude, longitude]
  const [description, setDescription] = useState("");
  const [amenities, setAmenities] = useState([]);
  const [checkInPolicies, setCheckInPolicies] = useState([]);
  const [checkOutPolicies, setCheckOutPolicies] = useState([]);
  const [preTypes, setPreTypes] = useState([]); // [type1, type2, type3, ...
  const [preAmenties, setPreAmenties] = useState([]); // [amenties1, amenties2, amenties3, ...]
  const [preCheckInPolicies, setPreCheckInPolicies] = useState([]); // [checkInPolicies1, checkInPolicies2, checkInPolicies3, ...]
  const [preCheckOutPolicies, setPreCheckOutPolicies] = useState([]); // [checkOutPolicies1, checkOutPolicies2, checkOutPolicies3, ...]
  const [openingDays, setOpeningDays] = useState([]);
  const [fee, setFee] = useState(0);
  const [images, setImages] = useState([]); // [image1, image2, image3, ...]
  const [existImages, setExistImages] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState({
    name: false,
    type: false,
    location: false,
    description: false,
    amenities: false,
    checkInPolicies: false,
    checkOutPolicies: false,
    openingDays: false,
    images: false,
  });
  useEffect(() => {
    getPreItems();
  }, []);

  const getPreItems = async () => {
    const currentType = "hotel";
    const typesResponse = await http.get(`/admin/get_types/${currentType}`);
    const amentiesResponse = await http.get(
      `/admin/get_amenities/${currentType}`
    );
    const checkInPoliciesResponse = await http.get(
      `/admin/get_check_in_policies/${currentType}`
    );
    const checkOutPoliciesResponse = await http.get(
      `/admin/get_check_out_policies/${currentType}`
    );
    setPreTypes(typesResponse.data.data);
    setPreAmenties(amentiesResponse.data.data);
    setPreCheckInPolicies(checkInPoliciesResponse.data.data);
    setPreCheckOutPolicies(checkOutPoliciesResponse.data.data);
  };
  useEffect(() => {
    if (_id) {
      setIsEdit(true);
      http.get(`/admin/get_hotel/${_id}`).then((response) => {
        const hotel = response.data.data;
        setName(hotel.name);
        setType(hotel.type.name);
        setLocation(hotel.location);
        setPosition([hotel.position.lat, hotel.position.lng]);
        setDescription(hotel.description);
        setAmenities(hotel.amenities.map((amenity) => amenity.name));
        setCheckInPolicies(hotel.checkIn.map((checkIn) => checkIn.name));
        setCheckOutPolicies(hotel.checkOut.map((checkOut) => checkOut.name));
        setOpeningDays(hotel.openingDays);
        setExistImages(hotel.images);
        setRooms(hotel.rooms);
        setFee(hotel.fee);
      });
    } else {
      init();
    }
  }, [_id]);
  const init = () => {
    setName("");
    setType("");
    setLocation("");
    setPosition([0, 0]);
    setDescription("");
    setAmenities([]);
    setCheckInPolicies([]);
    setCheckOutPolicies([]);
    setOpeningDays([]);
    setImages([]);
    setRooms([]);
    setFee(0);
  };
  const checkAndSetError = (value, key) => {
    setError((prevError) => ({ ...prevError, [key]: !value }));
    return !value;
  };
  const saveHotel = () => {
    if (checkAndSetError(name, "name")) return;
    if (checkAndSetError(type, "type")) return;
    if (
      checkAndSetError(
        location && position.some((pos) => pos !== 0),
        "location"
      )
    )
      return;
    if (checkAndSetError(description, "description")) return;
    if (checkAndSetError(amenities.length, "amenities")) return;
    if (checkAndSetError(checkInPolicies.length, "checkInPolicies")) return;
    if (checkAndSetError(checkOutPolicies.length, "checkOutPolicies")) return;
    if (checkAndSetError(openingDays.length, "openingDays")) return;
    if (checkAndSetError(images.length || existImages.length, "images")) return;

    const formData = new FormData();
    formData.append("name", name);
    formData.append(
      "type",
      preTypes.find((preType) => preType.name === type)._id
    );
    formData.append("location", location);
    formData.append("position", JSON.stringify(position));
    formData.append("description", description);
    formData.append(
      "amenities",
      JSON.stringify(
        amenities.map(
          (amenity) =>
            preAmenties.find((preAmenties) => preAmenties.name === amenity)._id
        )
      )
    );
    formData.append(
      "checkIn",
      JSON.stringify(
        checkInPolicies.map(
          (checkInPolicies) =>
            preCheckInPolicies.find(
              (preCheckInPolicies) =>
                preCheckInPolicies.name === checkInPolicies
            )._id
        )
      )
    );
    formData.append(
      "checkOut",
      JSON.stringify(
        checkOutPolicies.map(
          (checkOutPolicies) =>
            preCheckOutPolicies.find(
              (preCheckOutPolicies) =>
                preCheckOutPolicies.name === checkOutPolicies
            )._id
        )
      )
    );
    formData.append("openingDays", JSON.stringify(openingDays));
    formData.append("fee", fee);
    images.forEach((image, index) => {
      formData.append("images", image, `image${index}.png`);
    });
    if (isEdit) {
      formData.append("id", _id);
      formData.append("existImages", JSON.stringify(existImages));

      http
        .post("/admin/update_hotel", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          if (res.data.message === "Hotel Updated Successfully") {
            toast.success("Hotel Updated Successfully");
            navigate("/dashboard/all_hotels");
          } else {
            toast.error("Failed to update hotel");
          }
        });
    } else {
      http
        .post("/admin/add_hotel", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          if (res.data.message === "Hotel Added Successfully") {
            toast.success("Hotel Added Successfully");
            init();
          } else {
            toast.error("Failed to add hotel");
          }
        });
    }
  };
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    setImages((prevImages) => [...prevImages, ...files]);
  };
  const handleRemove = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };
  const handleRemoveExist = (index) => {
    setExistImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };
  const toEdit = (_id) => {
    navigate(`/dashboard/add_room/${_id}`);
  };

  const toDelete = (_id) => {
    http.delete(`/admin/delete_room/${_id}`).then((response) => {
      if (response.data.message === "Room deleted successfully") {
        toast.success("Room deleted successfully");
        http.get(`/admin/get_hotel/${_id}`).then((response) => {
          setRooms(response.data.data.rooms);
        });
      }
    });
  };
  return (
    <div className="flex gap-8">
      <div className="flex flex-col gap-3 pb-5">
        <h1 className="text-4xl text-black text-left font-abril font-semibold mb-11">
          {isEdit ? "Edit Hotel" : "Add Hotel"}
        </h1>
        <Input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {error.name && <p className="text-red-500 pl-2">Name is required</p>}
        <Select
          options={preTypes.map((type) => type.name)}
          value={type}
          onChange={(e) => setType(e.target.value)}
          placeholder="Type"
        />
        {error.type && <p className="text-red-500 pl-2">Type is required</p>}
        <GoogleAutocomplete
          value={location}
          placeholder="Location"
          getLocation={(location) => setPosition([location.lat, location.lng])}
          getAddress={(address) => setLocation(address)}
        />
        {error.location && (
          <p className="text-red-500 pl-2">Location is required</p>
        )}
        <TextArea
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {error.description && (
          <p className="text-red-500 pl-2">Description is required</p>
        )}

        <Modal
          placeholder={"Check Amenities"}
          options={preAmenties.map((amenties) => amenties.name)}
          values={amenities}
          onChange={(e) => setAmenities(e)}
          isMultiple={true}
        />
        {error.amenities && (
          <p className="text-red-500 pl-2">Amenities is required</p>
        )}

        <Modal
          placeholder={"Check In Policies"}
          options={preCheckInPolicies.map(
            (checkInPolicies) => checkInPolicies.name
          )}
          values={checkInPolicies}
          onChange={(e) => setCheckInPolicies(e)}
          isMultiple={true}
        />
        {error.checkInPolicies && (
          <p className="text-red-500 pl-2">Check In Policies is required</p>
        )}

        <Modal
          placeholder={"Check Out Policies"}
          options={preCheckOutPolicies.map(
            (checkOutPolicies) => checkOutPolicies.name
          )}
          values={checkOutPolicies}
          onChange={(e) => setCheckOutPolicies(e)}
          isMultiple={true}
        />
        {error.checkOutPolicies && (
          <p className="text-red-500 pl-2">Check Out Policies is required</p>
        )}

        <Modal
          options={[
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ]}
          placeholder="Opening Days"
          values={openingDays}
          onChange={(e) => setOpeningDays(e)}
          isMultiple={true}
        />
        <Input
          type="number"
          placeholder="Fee"
          value={fee}
          onChange={(e) => setFee(e.target.value)}
        />
        {error.openingDays && (
          <p className="text-red-500 pl-2">Opening Days is required</p>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: "none" }}
          id="fileUpload"
        />
        <div className="flex gap-3">
          {existImages.map((existImage, index) => (
            <div
              className="relative w-[66px] h-[66px] rounded-[10px] hover:bg-gray-200 cursor-pointer"
              key={index}
            >
              <img
                alt=""
                src={`${uploadPath}${existImage}`}
                className="absolute top-0 left-0 w-full h-full rounded-[10px]"
              />
              <div className="absolute top-0 left-0 w-full h-full rounded-[10px] flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                <button
                  className="p-1 bg-red-500 text-white rounded-full"
                  onClick={() => handleRemoveExist(index)}
                >
                  X
                </button>
              </div>
            </div>
          ))}
          {images.map((image, index) => (
            <div
              className="relative w-[66px] h-[66px] rounded-[10px] hover:bg-gray-200 cursor-pointer"
              key={index}
            >
              <img
                alt=""
                src={URL.createObjectURL(image)}
                className="absolute top-0 left-0 w-full h-full rounded-[10px]"
              />
              <div className="absolute top-0 left-0 w-full h-full rounded-[10px] flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                <button
                  className="p-1 bg-red-500 text-white rounded-full"
                  onClick={() => handleRemove(index)}
                >
                  X
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={() => document.getElementById("fileUpload").click()}
            className="w-[66px] h-[66px] rounded-[10px] bg-white flex justify-center items-center"
          >
            <span className="text-black text-[26px] font-bold">+</span>
          </button>
        </div>
        {error.images && (
          <p className="text-red-500 pl-2">Images is required</p>
        )}
        <Button
          title={isEdit ? "Update Hotel" : "Add Hotel"}
          onClick={saveHotel}
        />
        <ToastContainer />
      </div>
      {isEdit && (
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl text-black text-left font-abril font-semibold mb-11">
            Room Lists
          </h1>
          <div>
            {rooms.map((room) => (
              <div key={room.id} className="flex gap-2">
                <div className="w-[300px] h-[60px] rounded-[13px] px-5 bg-white flex items-center mb-2 text-ellipsis">
                  {room.name}
                </div>
                <div
                  className="h-[60px] w-[60px] rounded-[13px] bg-white flex items-center justify-center cursor-pointer hover:bg-[#EEE] p-3"
                  onClick={() => toEdit(room._id)}
                >
                  <EditIcon />
                </div>
                <div
                  className="h-[60px] w-[60px] rounded-[13px] bg-white flex items-center justify-center cursor-pointer hover:bg-[#EEE] p-3"
                  onClick={() => toDelete(room._id)}
                >
                  <DeleteIcon />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddHotelComponent;
