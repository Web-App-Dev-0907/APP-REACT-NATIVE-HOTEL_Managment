import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "react-phone-number-input/style.css";
import { http } from "../helper/http";

const AdminSignIn = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const SignIn = () => {
    http
      .post("/admin/user_signin", { name, password, role: "user" })
      .then((res) => {
        switch (res.data.message) {
          case "Hotel SignIn Successfully":
            sessionStorage.setItem("name", name);
            sessionStorage.setItem("isHotel", "true");
            navigate("/dashboard");
            break;
          case "Spot SignIn Successfully":
            sessionStorage.setItem("name", name);
            sessionStorage.setItem("isHotel", "false");
            navigate("/dashboard");
            break;
          default:
            setError(true);
            break;
        }
      });
  };
  return (
    <div className="bg-[#1BF2DD] flex-1 w-screen h-screen relative">
      <h1 className="text-4xl text-black text-left pt-[150px] pl-[80px] font-abril font-semibold">
        Welcome
      </h1>
      <div className="pl-[200px] pt-[50px] w-[200px]">
        <input
          placeholder="Hotel Or Spot Id"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-white w-[200px] h-[50px] mt-[20px] ml-[80px] p-5 rounded-[10px]"
        />
        <input
          placeholder="Password?"
          type="password"
          className="bg-white w-[200px] h-[50px] mt-[20px] ml-[80px] p-5 rounded-[10px]"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <p className="text-red-500 text-[12px] mt-[10px] ml-[80px] w-[150px] font-bold">
            Invalid Credentials
          </p>
        )}
      </div>
      <div className="absolute bottom-[120px] right-[120px]" onClick={SignIn}>
        <div className="px-[25px] py-[10px] rounded-[13px] bg-[#FF5C00] flex justify-center items-center cursor-pointer">
          <span className="text-white text-[16px] font-bold">Sign In</span>
        </div>
      </div>
    </div>
  );
};

export default AdminSignIn;
