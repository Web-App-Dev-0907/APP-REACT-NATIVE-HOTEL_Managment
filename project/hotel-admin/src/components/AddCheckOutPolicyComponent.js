import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Input, Button } from "./CustomTheme";
import { http } from "../helper/http";
import { ToastContainer, toast } from "react-toastify";
import EditIcon from "./SvgIcons/EditIcon";
import DeleteIcon from "./SvgIcons/DeleteIcon";
const AddCheckOutPolicyComponent = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const currentType = pathname.includes("add_check_out_policy_hotel")
    ? "hotel"
    : "spot";
  const { _id } = useParams();
  const [isEdit, setIsEdit] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState({ name: false });
  const [checkOutPolicies, setCheckOutPolicies] = useState([]);

  useEffect(() => {
    getCheckOutPolicies();
  }, [currentType]);

  useEffect(() => {
    if (_id) {
      setIsEdit(true);
      http.get(`/admin/get_check_out_policy/${_id}`).then((response) => {
        const { name } = response.data.data;
        setName(name);
      });
    } else {
      setIsEdit(false);
      setName("");
    }
  }, [_id]);
  const getCheckOutPolicies = () => {
    http
      .get(`/admin/get_check_out_policies/${currentType}`)
      .then((response) => {
        setCheckOutPolicies(response.data.data);
      })
      .catch((err) => {
        setCheckOutPolicies([]);
      });
  };

  const toEdit = (_id) => {
    navigate(`/dashboard/add_check_out_policy_${currentType}/${_id}`);
  };

  const toDelete = (_id) => {
    http.delete(`/admin/delete_check_out_policy/${_id}`).then((response) => {
      if (response.data.message === "CheckOutPolicy deleted successfully") {
        toast.success("CheckOutPolicy deleted successfully");
        navigate(`/dashboard/add_check_out_policy_${currentType}`);
        getCheckOutPolicies();
      }
    });
  };

  const checkAndSetError = (value, key) => {
    setError((prevError) => ({ ...prevError, [key]: !value }));
    return !value;
  };

  const saveAmenity = () => {
    if (checkAndSetError(name, "name")) return;
    const formData = new FormData();
    formData.append("name", name);
    formData.append("type", currentType);

    if (isEdit) {
      formData.append("id", _id);

      http.post("/admin/update_check_out_policy", formData).then((response) => {
        if (response.data.message === "CheckOutPolicy updated successfully") {
          toast.success("CheckOutPolicy updated successfully");
          setName("");
          setIsEdit(false);
          navigate(`/dashboard/add_check_out_policy_${currentType}`);
          getCheckOutPolicies();
        }
      });
    } else {
      http.post("/admin/add_check_out_policy", formData).then((response) => {
        if (response.data.message === "CheckOutPolicy added successfully") {
          toast.success("CheckOutPolicy added successfully");
          setName("");
          getCheckOutPolicies();
        }
      });
    }
  };
  return (
    <div className="flex gap-8">
      <div className="flex flex-col gap-3 pb-5">
        <h1 className="text-4xl text-black text-left font-abril font-semibold mb-11">
          {isEdit ? "Edit Check Out Policy" : "Add Check Out Policy"}
        </h1>
        <Input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {error.name && <p className="text-red-500 pl-2">Name is required</p>}

        <Button
          title={isEdit ? "Update Check Out Policy" : "Add Check Out Policy"}
          onClick={saveAmenity}
        />
        <ToastContainer />
        {checkOutPolicies.length > 0 && (
          <div className="flex flex-col gap-3 mt-5">
            <h1 className="text-4xl text-black text-left font-abril font-semibold mb-5">
              Room Lists
            </h1>
            <div>
              {checkOutPolicies.map((type) => (
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

export default AddCheckOutPolicyComponent;
