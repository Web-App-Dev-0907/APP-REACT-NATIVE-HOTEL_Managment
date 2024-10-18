import React, { useEffect, useState } from "react";
import LinkContainer, { SmallLink } from "../components/LinkContainer";
import { adminLinks, hotelLinks, spotLinks } from "../lib/Links";
import { Outlet, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("DashBoard");
  const [links, setLinks] = useState(adminLinks);
  const [activeSmallTab, setActiveSmallTab] = useState("");
  useEffect(() => {
    const name = sessionStorage.getItem("name");
    const isHotel = JSON.parse(sessionStorage.getItem("isHotel"));
    if (name) {
      setLinks(isHotel ? hotelLinks : spotLinks);
    }
  }, []);
  const onClickTab = (title, path) => {
    setActiveTab(title);
    setActiveSmallTab("");
    path && navigate(`/dashboard/${path}`);
  };
  const onClickSmallTab = (title, path) => {
    setActiveSmallTab(title);
    path && navigate(`/dashboard/${path}`);
  };
  return (
    <div className="bg-[#D0D8DA] w-full h-screen overflow-auto overflow-x-hidden flex pt-[80px]">
      <div className="w-2/5 px-[76px]">
        <h1 className="text-4xl text-black text-left font-abril font-semibold mb-11">
          Welcome
        </h1>
        {links.map((link) => (
          <LinkContainer
            key={link.title}
            path={link.path}
            title={link.title}
            onClick={onClickTab}
            activeTab={activeTab}
          >
            {link.subLinks && (
              <div>
                {link.subLinks.map((subLink) => (
                  <SmallLink
                    key={subLink.title}
                    title={subLink.title}
                    path={subLink.path}
                    activeSmallTab={activeSmallTab}
                    onClick={onClickSmallTab}
                  />
                ))}
              </div>
            )}
          </LinkContainer>
        ))}
      </div>
      <div className="w-1/2 px-[76px]">
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
