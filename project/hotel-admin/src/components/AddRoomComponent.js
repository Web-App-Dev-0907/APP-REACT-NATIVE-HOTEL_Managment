import { useEffect, useState } from "react";
import { Button, Input, Modal, Select } from "./CustomTheme";
import { http, uploadPath } from "../helper/http";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, useNavigate } from "react-router-dom";
import EditIcon from "./SvgIcons/EditIcon";
import DeleteIcon from "./SvgIcons/DeleteIcon";
const AddRoomComponent = () => {
  const navigate = useNavigate();
  const { _id } = useParams();
  const [isEdit, setIsEdit] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [hotel, setHotel] = useState("");
  const [hotels, setHotels] = useState([]);
  const [name, setName] = useState("");
  const [guestAllowed, setGuestAllowed] = useState("");
  const [amenities, setAmenities] = useState([]);
  const [preAmenties, setPreAmenties] = useState([]); // [amenties1, amenties2, amenties3, ...]
  const [preCancellationPolicy, setPreCancellationPolicy] = useState([]); // [policy1, policy2, policy3, ...
  const [price, setPrice] = useState("");
  const [wasPrice, setWasPrice] = useState("");
  const [roomAvailable, setRoomAvailable] = useState("");
  const [cancellationPolicy, setCancellationPolicy] = useState("");
  const [images, setImages] = useState([]); // [image1, image2, image3, ...]
  const [existImages, setExistImages] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState({
    hotel: false,
    name: false,
    guestAllowed: false,
    amenities: false,
    price: false,
    wasPrice: false,
    roomAvailable: false,
    cancellationPolicy: false,
    images: false,
  });

  useEffect(() => {
    getHotelIdsAndNames();
    getPreItems();
  }, []);
  useEffect(() => {
    if (_id) {
      setIsEdit(true);
      http.get(`/admin/get_room/${_id}`).then((res) => {
        const room = res.data.data;
        setHotel(room.hotel.identifier);
        setName(room.name);
        setGuestAllowed(room.guestAllowed);
        setAmenities(room.amenities.map((eachAmenity) => eachAmenity.name));
        setPrice(room.price);
        setWasPrice(room.wasPrice);
        setRoomAvailable(room.roomAvailable);
        setCancellationPolicy(room.cancellationPolicy.name);
        setExistImages(room.images);
        getRoomsBelongToHotel(room.hotel._id);
      });
    } else {
      init();
    }
  }, [_id]);

  useEffect(() => {
    if (
      hotel.length > 0 &&
      hotels.some((eachRoom) => eachRoom.identifier === hotel)
    ) {
      const { _id } = hotels.find((eachSpot) => eachSpot.identifier === hotel);
      _id && getRoomsBelongToHotel(_id);
    } else {
      setRooms([]);
    }
  }, [hotel, hotels]);

  const init = () => {
    if (!isUser) {
      setHotel("");
    }
    setName("");
    setGuestAllowed("");
    setAmenities("");
    setPrice("");
    setWasPrice("");
    setRoomAvailable("");
    setCancellationPolicy("");
    setImages([]);
    setIsEdit(false);
  };

  const getPreItems = async () => {
    const currentType = "hotel";
    const amentiesResponse = await http.get(
      `/admin/get_amenities/${currentType}`
    );
    const cancellationPolicyResponse = await http.get(
      `/admin/get_cancellation_policies/${currentType}`
    );
    setPreAmenties(amentiesResponse.data.data);
    setPreCancellationPolicy(cancellationPolicyResponse.data.data);
  };
  const getHotelIdsAndNames = () => {
    http
      .get("/admin/get_hotel_identifiers")
      .then((res) => {
        if (res.data.message === "Hotel Names Fetched Successfully") {
          setHotels(res.data.hotels);
          const name = sessionStorage.getItem("name");
          if (name) {
            setIsUser(true);
            setHotel(name);
            const id = res.data.hotels.find(
              (hotel) => hotel.identifier === name
            )._id;
            getRoomsBelongToHotel(id);
          }
        } else {
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const getRoomsBelongToHotel = (id) => {
    http.get(`/admin/get_hotel/${id}`).then((response) => {
      setRooms(response.data.data.rooms);
    });
  };
  const checkAndSetError = (value, key) => {
    setError((prevError) => ({ ...prevError, [key]: !value }));
    return !value;
  };
  const saveRoom = () => {
    if (checkAndSetError(hotel, "hotel")) return;
    if (checkAndSetError(name, "name")) return;
    if (checkAndSetError(guestAllowed, "guestAllowed")) return;
    if (checkAndSetError(amenities.length, "amenities")) return;
    if (checkAndSetError(price, "price")) return;
    if (checkAndSetError(wasPrice, "wasPrice")) return;
    if (checkAndSetError(roomAvailable, "roomAvailable")) return;
    if (checkAndSetError(cancellationPolicy, "cancellationPolicy")) return;
    if (checkAndSetError(images.length || existImages.length, "images")) return;

    const formData = new FormData();

    formData.append("hotel", hotels.find((h) => h.identifier === hotel)._id);
    formData.append("name", name);
    formData.append("guestAllowed", guestAllowed);
    formData.append(
      "amenities",
      JSON.stringify(
        amenities.map(
          (amenity) =>
            preAmenties.find((preAmenties) => preAmenties.name === amenity)._id
        )
      )
    );
    formData.append("price", price);
    formData.append("wasPrice", wasPrice);
    formData.append("roomAvailable", roomAvailable);
    formData.append(
      "cancellationPolicy",
      JSON.stringify(
        preCancellationPolicy.find(
          (prePolicy) => prePolicy.name === cancellationPolicy
        )._id
      )
    );

    images.forEach((image, index) => {
      formData.append("images", image, `image${index}.png`);
    });
    if (isEdit) {
      formData.append("id", _id);
      formData.append("existImages", JSON.stringify(existImages));

      http
        .post("/admin/update_room", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          if (res.data.message === "Room Updated Successfully") {
            toast.success("Room Updated Successfully");
            if (!isUser) {
              navigate("/dashboard/all_hotels");
            }
          } else {
            toast.error("Failed to update room");
          }
        });
    } else {
      http
        .post("/admin/add_room", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          if (res.data.message === "Room Added Successfully") {
            toast.success("Room Added Successfully");
            init();
          } else {
            toast.error("Room Not Added Successfully");
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
    <div className="flex flex-col gap-3 pb-5">
      <h1 className="text-4xl text-black text-left font-abril font-semibold mb-11">
        {isEdit ? "Edit Room" : "Add Room"}
      </h1>
      <div className="flex gap-3 items-center">
        <Input
          type="text"
          placeholder="Hotel"
          value={hotel}
          onChange={(e) => setHotel(e.target.value)}
          disabled={isUser || isEdit}
        />
        {hotel.length > 0 &&
          !hotels.some((eachHotel) => eachHotel.identifier === hotel) && (
            <p className="text-red-500 text-[12px] font-bold capitalize">
              Hotel Identifier Not Matched
            </p>
          )}
        {hotels.some((eachHotel) => eachHotel.identifier === hotel) && (
          <p className="text-green-500 text-[12px] font-bold capitalize">
            Hotel Identifier Matched
          </p>
        )}
      </div>
      {error.hotel && <p className="text-red-500 pl-2">Hotel is required</p>}
      <Input
        type="text"
        placeholder="Room Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {error.name && <p className="text-red-500 pl-2">Room Name is required</p>}
      <Input
        type="number"
        placeholder="Guest Allowed"
        value={guestAllowed}
        onChange={(e) => setGuestAllowed(e.target.value)}
      />
      {error.guestAllowed && (
        <p className="text-red-500 pl-2">Guest Allowed is required</p>
      )}
      <Modal
        placeholder={"Check Amenities"}
        options={preAmenties.map((eachAmenity) => eachAmenity.name)}
        values={amenities}
        onChange={(e) => setAmenities(e)}
        isMultiple={true}
      />
      {error.amenities && (
        <p className="text-red-500 pl-2">Amenities is required</p>
      )}
      <Select
        options={preCancellationPolicy.map((eachPolicy) => eachPolicy.name)}
        value={cancellationPolicy}
        onChange={(e) => setCancellationPolicy(e.target.value)}
        placeholder="Select Cancellation Policy"
      />
      {error.cancellationPolicy && (
        <p className="text-red-500 pl-2">Cancellation Policy is required</p>
      )}
      <Input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      {error.price && <p className="text-red-500 pl-2">Price is required</p>}
      <Input
        type="number"
        placeholder="Was Price"
        value={wasPrice}
        onChange={(e) => setWasPrice(e.target.value)}
      />
      {error.wasPrice && (
        <p className="text-red-500 pl-2">Was Price is required</p>
      )}
      <Input
        type="number"
        placeholder="Room Available"
        value={roomAvailable}
        onChange={(e) => setRoomAvailable(e.target.value)}
      />
      {error.roomAvailable && (
        <p className="text-red-500 pl-2">Room Available is required</p>
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
      {error.images && <p className="text-red-500 pl-2">Images is required</p>}
      <Button title={isEdit ? "Update Room" : "Add Room"} onClick={saveRoom} />
      {rooms.length > 0 && (
        <div className="flex flex-col gap-3 mt-5">
          <h1 className="text-4xl text-black text-left font-abril font-semibold mb-5">
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
      <ToastContainer />
    </div>
  );
};

export default AddRoomComponent;
