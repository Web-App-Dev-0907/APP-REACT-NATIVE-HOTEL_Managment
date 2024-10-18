import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Input, Button } from "./CustomTheme";
import { http, uploadPath } from "../helper/http";
import { ToastContainer, toast } from "react-toastify";
import EditIcon from "./SvgIcons/EditIcon";
import DeleteIcon from "./SvgIcons/DeleteIcon";
const AmenityComponent = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const currentType = pathname.includes("add_amenity_hotel") ? "hotel" : "spot";
  const { _id } = useParams();
  const [isEdit, setIsEdit] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState({ name: false });
  const [images, setImages] = useState([]); // [image1, image2, image3, ...]
  const [existImages, setExistImages] = useState([]);
  const [amenities, setAmenities] = useState([]);

  useEffect(() => {
    getamenities();
  }, [currentType]);

  useEffect(() => {
    if (_id) {
      setIsEdit(true);
      http.get(`/admin/get_amenity/${_id}`).then((response) => {
        const { name, images } = response.data.data;
        setName(name);
        setExistImages(images);
      });
    } else {
      setIsEdit(false);
      setName("");
      setImages([]);
      setExistImages([]);
    }
  }, [_id]);
  const getamenities = () => {
    http
      .get(`/admin/get_amenities/${currentType}`)
      .then((response) => {
        setAmenities(response.data.data);
      })
      .catch((err) => {
        setAmenities([]);
      });
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
    navigate(`/dashboard/add_amenity_${currentType}/${_id}`);
  };

  const toDelete = (_id) => {
    http.delete(`/admin/delete_amenity/${_id}`).then((response) => {
      if (response.data.message === "Amenity deleted successfully") {
        toast.success("Amenity deleted successfully");
        navigate(`/dashboard/add_amenity_${currentType}`);
        getamenities();
      }
    });
  };

  const checkAndSetError = (value, key) => {
    setError((prevError) => ({ ...prevError, [key]: !value }));
    return !value;
  };

  const saveAmenity = () => {
    if (checkAndSetError(name, "name")) return;
    if (checkAndSetError(images.length || existImages.length, "images")) return;
    const formData = new FormData();
    formData.append("name", name);
    formData.append("type", currentType);
    images.forEach((image, index) => {
      formData.append("images", image, `image${index}.png`);
    });
    if (isEdit) {
      formData.append("id", _id);
      formData.append("existImages", JSON.stringify(existImages));

      http
        .post("/admin/update_amenity", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          if (response.data.message === "Amenity updated successfully") {
            toast.success("Amenity updated successfully");
            setName("");
            setImages([]);
            setExistImages([]);
            setIsEdit(false);
            navigate(`/dashboard/add_amenity_${currentType}`);
            getamenities();
          }
        });
    } else {
      http
        .post("/admin/add_amenity", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          if (response.data.message === "Amenity added successfully") {
            toast.success("Amenity added successfully");
            setName("");
            setImages([]);
            setExistImages([]);
            getamenities();
          }
        });
    }
  };
  return (
    <div className="flex gap-8">
      <div className="flex flex-col gap-3 pb-5">
        <h1 className="text-4xl text-black text-left font-abril font-semibold mb-11">
          {isEdit ? "Edit Amenity" : "Add Amenity"}
        </h1>
        <Input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {error.name && <p className="text-red-500 pl-2">Name is required</p>}
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
          title={isEdit ? "Update Amenity" : "Add Amenity"}
          onClick={saveAmenity}
        />
        <ToastContainer />
        {amenities.length > 0 && (
          <div className="flex flex-col gap-3 mt-5">
            <h1 className="text-4xl text-black text-left font-abril font-semibold mb-5">
              Room Lists
            </h1>
            <div>
              {amenities.map((type) => (
                <div key={type.id} className="flex gap-2">
                  <div className="w-[300px] h-[60px] rounded-[13px] px-5 bg-white flex items-center mb-2 text-ellipsis">
                    {type.name}
                  </div>
                  <div
                    className="h-[60px] w-[60px] rounded-[13px] bg-white flex items-center justify-center cursor-pointer hover:bg-[#EEE] p-3"
                    onClick={() => toEdit(type._id)}
                  >
                    <EditIcon />
                  </div>
                  <div
                    className="h-[60px] w-[60px] rounded-[13px] bg-white flex items-center justify-center cursor-pointer hover:bg-[#EEE] p-3"
                    onClick={() => toDelete(type._id)}
                  >
                    <DeleteIcon />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AmenityComponent;
