export const SmallLink = ({ title, activeSmallTab, onClick, path }) => {
  return (
    <div
      className={`mx-5 my-2 ${
        title === activeSmallTab ? "text-[#FD3A84]" : "text-[#000]"
      } font-bold cursor-pointer text-[18px] capitalize hover:opacity-90`}
      onClick={() => onClick(title, path)}
    >
      {title}
    </div>
  );
};

const LinkContainer = ({ children, title, path, activeTab, onClick }) => {
  return (
    <div>
      <div
        className={`w-[280px] h-[60px] flex px-10 items-center rounded-[13px] ${
          activeTab === title ? "bg-[#222]" : "bg-[#FF5C00]"
        } cursor-pointer mb-[20px] hover:opacity-90`}
        onClick={() => onClick(title, path)}
      >
        <span className="text-white text-[20px] font-bold">{title}</span>
      </div>
      {activeTab === title && children}
    </div>
  );
};
export default LinkContainer;
